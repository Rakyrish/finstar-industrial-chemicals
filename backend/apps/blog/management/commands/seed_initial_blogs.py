"""
Management command: seed_initial_blogs
Run once at deployment to generate 6 high-quality AI blog articles.

Usage:
    python manage.py seed_initial_blogs
    python manage.py seed_initial_blogs --dry-run
"""
import json
import time

from django.core.management.base import BaseCommand
from django.utils import timezone

SEED_TOPICS = [
    'Industrial Chemical Safety Standards in East Africa — KEBS and GHS Compliance',
    'Chemical Storage and Handling Best Practices for Industrial Facilities in Kenya',
    'Understanding Safety Data Sheets (SDS) for Industrial Chemicals in Kenya',
    'Industrial Cleaning Chemicals: Choosing the Right Product for Your Process',
    'ISO 9001 and Chemical Supply Chain Quality Management in East Africa',
    'Corrosion Inhibitors and Chemical Protection for Industrial Equipment',
]


class Command(BaseCommand):
    help = 'Generate and save 6 initial seed blog posts via OpenAI GPT-4o-mini.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Print prompts without saving.')
        parser.add_argument('--skip-existing', action='store_true', default=True, help='Skip topics already in DB.')

    def handle(self, *args, **options):
        from blog.models import BlogPost, BlogCategory, BlogTag, BlogGenerationLog
        from blog.quality_engine import quality_engine
        from blog.linking_engine import inject_internal_links, get_link_context
        from services.openai_service import openai_service

        dry_run = options.get('dry_run', False)
        created = 0

        for topic in SEED_TOPICS:
            self.stdout.write(f'\n📝  Generating: {topic[:60]}...')

            retries = 0
            best_data = None
            best_score = 0

            for attempt in range(3):
                try:
                    data = openai_service.generate_blog_content(topic=topic)
                except Exception as exc:
                    self.stderr.write(f'  ⚠ OpenAI error attempt {attempt+1}: {exc}')
                    time.sleep(3)
                    retries += 1
                    continue

                faq_items = data.get('faq', [])
                body_html = data.get('body_html', '')
                result = quality_engine.score(
                    title=data.get('seo_title', ''),
                    body_html=body_html,
                    meta_title=data.get('seo_title', ''),
                    meta_description=data.get('meta_description', ''),
                    excerpt=data.get('excerpt', ''),
                    faq_items=faq_items,
                )
                score = result['score']
                self.stdout.write(f'  Attempt {attempt+1}: quality score = {score}/100')

                if score > best_score:
                    best_score = score
                    best_data = data
                    best_data['_faq_items'] = faq_items
                    best_data['_body_html'] = body_html

                if score >= 75:
                    break
                retries += 1
                time.sleep(2)

            if not best_data or best_score < 65:
                self.stderr.write(f'  ✗ Skipping — best score was {best_score} (min 65).')
                BlogGenerationLog.objects.create(
                    triggered_by='seed', topic_used=topic, tokens_used=0,
                    quality_score=best_score, retries=retries, status='failed',
                    error_log=f'Max retries exceeded. Best score: {best_score}',
                )
                continue

            if dry_run:
                self.stdout.write(f'  [DRY-RUN] Would create: {best_data.get("seo_title")} (score={best_score})')
                continue

            # Inject internal links
            try:
                p_slugs, s_slugs, d_slugs = get_link_context()
                linked_html = inject_internal_links(best_data['_body_html'], p_slugs, s_slugs, d_slugs)
            except Exception:
                linked_html = best_data['_body_html']

            # Category
            cat_name = (best_data.get('category') or 'Technical Guide').strip()
            category, _ = BlogCategory.objects.get_or_create(name=cat_name)

            blog = BlogPost.objects.create(
                title=best_data.get('seo_title', topic)[:200],
                excerpt=(best_data.get('excerpt') or '')[:300] or None,
                content=linked_html,
                faq_json=json.dumps(best_data['_faq_items']),
                author_name='Finstar Editorial Team',
                category=category,
                meta_title=(best_data.get('seo_title') or '')[:70] or None,
                meta_description=(best_data.get('meta_description') or '')[:160] or None,
                og_description=(best_data.get('og_description') or '')[:300] or None,
                cover_image_alt=(best_data.get('cover_image_alt') or '')[:200] or None,
                quality_score=best_score,
                status='published',
                published_at=timezone.now(),
            )

            # Tags
            for tag_name in (best_data.get('tags') or [])[:8]:
                tag, _ = BlogTag.objects.get_or_create(name=tag_name.strip()[:100])
                blog.tags.add(tag)

            BlogGenerationLog.objects.create(
                blog=blog, triggered_by='seed', topic_used=topic,
                tokens_used=0, quality_score=best_score, retries=retries, status='success',
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(f'  ✓ Saved: "{blog.title[:60]}" (score={best_score})'))

        self.stdout.write(self.style.SUCCESS(f'\n✅  Seeding complete. {created}/{len(SEED_TOPICS)} blogs created.'))
