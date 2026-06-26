"""
Celery tasks for automated weekly blog generation.
Runs Monday & Thursday at 09:00 EAT (06:00 UTC) via Celery Beat.
"""
import json
import random
import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_weekly_blogs(self):
    """
    Celery Beat task — called Monday & Thursday 09:00 EAT.
    1. Selects an unused topic from WEEKLY_BLOG_TOPIC_POOL
    2. Calls OpenAI to generate full article
    3. Runs it through Content Quality Engine
    4. Saves as draft (or published if AUTO_PUBLISH_BLOGS=True)
    5. Notifies admin via email
    6. Logs to BlogGenerationLog
    """
    from blog.models import BlogPost, BlogGenerationLog
    from blog.quality_engine import quality_engine
    from blog.linking_engine import inject_internal_links, get_link_context
    from services.openai_service import openai_service

    topic_pool = [
        t.strip()
        for t in (settings.WEEKLY_BLOG_TOPIC_POOL or '').split(',')
        if t.strip()
    ]

    # Avoid re-generating topics already covered
    existing_slugs = set(BlogPost.objects.values_list('slug', flat=True))
    used_topics = {s.replace('-', ' ') for s in existing_slugs}

    available = [t for t in topic_pool if t.lower() not in used_topics]
    if not available:
        available = topic_pool  # recycle if exhausted

    topic = random.choice(available)
    log_entry = None
    retries = 0
    generated_blog = None

    for attempt in range(3):
        try:
            data = openai_service.generate_blog_content(topic=topic)
        except Exception as exc:
            logger.error(f'[BlogTask] OpenAI error on attempt {attempt+1}: {exc}')
            retries += 1
            continue

        faq_items = data.get('faq', [])
        body_html = data.get('body_html', '')

        # Run Quality Engine
        quality_result = quality_engine.score(
            title=data.get('seo_title', ''),
            body_html=body_html,
            meta_title=data.get('seo_title', ''),
            meta_description=data.get('meta_description', ''),
            excerpt=data.get('excerpt', ''),
            faq_items=faq_items,
        )
        score = quality_result['score']

        if score >= 65:
            # Inject internal links
            try:
                product_slugs, service_slugs, doc_slugs = get_link_context()
                body_html = inject_internal_links(body_html, product_slugs, service_slugs, doc_slugs)
            except Exception:
                pass  # linking is best-effort

            # Create or get category
            from blog.models import BlogCategory, BlogTag
            cat_name = (data.get('category') or 'Technical Guide').strip()
            category, _ = BlogCategory.objects.get_or_create(name=cat_name)

            # Determine status
            auto_publish = getattr(settings, 'AUTO_PUBLISH_BLOGS', False)
            pub_at = timezone.now() if auto_publish else None
            post_status = 'published' if auto_publish else 'draft'

            blog = BlogPost.objects.create(
                title=data.get('seo_title', topic)[:200],
                excerpt=data.get('excerpt', '')[:300] if data.get('excerpt') else None,
                content=body_html,
                faq_json=json.dumps(faq_items),
                author_name='Finstar Editorial Team',
                category=category,
                meta_title=data.get('seo_title', '')[:70] if data.get('seo_title') else None,
                meta_description=data.get('meta_description', '')[:160] if data.get('meta_description') else None,
                og_description=data.get('og_description', '')[:300] if data.get('og_description') else None,
                cover_image_alt=data.get('cover_image_alt', '')[:200] if data.get('cover_image_alt') else None,
                quality_score=score,
                status=post_status,
                published_at=pub_at,
            )

            # Tags
            for tag_name in (data.get('tags') or [])[:8]:
                tag, _ = BlogTag.objects.get_or_create(name=tag_name.strip()[:100])
                blog.tags.add(tag)

            generated_blog = blog

            # Log success
            tokens = 0  # tokens tracked via AiUsageLog
            log_entry = BlogGenerationLog.objects.create(
                blog=blog,
                triggered_by='scheduler',
                topic_used=topic,
                tokens_used=tokens,
                quality_score=score,
                retries=retries,
                status='success',
            )

            # Notify admin
            _notify_admin_email(blog, score, topic)
            logger.info(f'[BlogTask] ✅ Blog "{blog.title}" generated. Score={score}. Status={post_status}.')
            return {'status': 'success', 'blog_id': blog.id, 'quality_score': score}

        else:
            logger.warning(f'[BlogTask] Quality score {score} < 65 on attempt {attempt+1}. Retrying...')
            retries += 1

    # All retries failed
    error_msg = f'Failed to generate quality blog for topic: {topic}. All {retries} attempts scored < 65.'
    logger.error(f'[BlogTask] ❌ {error_msg}')
    BlogGenerationLog.objects.create(
        blog=None,
        triggered_by='scheduler',
        topic_used=topic,
        tokens_used=0,
        quality_score=0,
        retries=retries,
        status='failed',
        error_log=error_msg,
    )
    return {'status': 'failed', 'topic': topic}


def _notify_admin_email(blog, score: int, topic: str):
    """Send a notification email to the admin after blog generation."""
    email = getattr(settings, 'BLOG_NOTIFICATION_EMAIL', '')
    if not email:
        return
    try:
        send_mail(
            subject=f'[Finstar] New AI Blog Generated: {blog.title[:60]}',
            message=(
                f'A new blog post has been generated automatically.\n\n'
                f'Title:         {blog.title}\n'
                f'Topic:         {topic}\n'
                f'Quality Score: {score}/100\n'
                f'Status:        {blog.status}\n'
                f'Generated at:  {blog.created_at.strftime("%Y-%m-%d %H:%M EAT")}\n\n'
                f'Review and publish at: {getattr(settings, "SITE_URL", "")}/admin/blog\n'
            ),
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@finstar.com'),
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as exc:
        logger.warning(f'[BlogTask] Admin email failed: {exc}')
