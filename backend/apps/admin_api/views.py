from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from django.db import IntegrityError
from django.db.models import Count, Sum, Q, Avg, F
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from decimal import Decimal, InvalidOperation
import json as _json

# Models
from products.models import Product, Category, Tag
from inquiries.models import QuoteRequest, ContactMessage
from chatbot.models import ChatSession, ChatMessage
from blog.models import BlogPost
from seo.models import SeoPage
from analytics.models import PageView, SearchQuery, WhatsAppClick, PhoneClick
from inventory.models import StockItem

# Serializers
from products.serializers import ProductListSerializer, ProductDetailSerializer

User = get_user_model()


def chart_point(label, value):
    return {"label": str(label), "value": int(value or 0)}


class AdminOverviewView(APIView):
    """
    Returns real database metrics, traffic trends, inventory alerts, activity logs, 
    and recent additions to populate the primary Admin Dashboard overview in one payload.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        sixty_days_ago = now - timedelta(days=60)

        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        prev_products = Product.objects.filter(created_at__lt=thirty_days_ago).count()
        products_change = f"+{total_products - prev_products}" if total_products >= prev_products else f"-{prev_products - total_products}"

        total_inquiries = ContactMessage.objects.count()
        prev_inquiries = ContactMessage.objects.filter(created_at__lt=thirty_days_ago).count()
        inquiries_change = f"+{total_inquiries - prev_inquiries}" if total_inquiries >= prev_inquiries else f"-{prev_inquiries - total_inquiries}"

        total_quotes = QuoteRequest.objects.count()
        prev_quotes = QuoteRequest.objects.filter(created_at__lt=thirty_days_ago).count()
        quotes_change = f"+{total_quotes - prev_quotes}" if total_quotes >= prev_quotes else f"-{prev_quotes - total_quotes}"

        total_chats = ChatSession.objects.count()
        prev_chats = ChatSession.objects.filter(created_at__lt=thirty_days_ago).count()
        chats_change = f"+{total_chats - prev_chats}" if total_chats >= prev_chats else f"-{prev_chats - total_chats}"
        website_visits = PageView.objects.count()
        low_stock_count = StockItem.objects.filter(quantity_on_hand__lte=F('safety_stock_level')).count()
        inventory_units = StockItem.objects.aggregate(total=Sum('quantity_on_hand'))['total'] or 0

        metrics = [
            {"label": "Products", "value": str(total_products), "change": f"{products_change} this month", "trend": "up" if total_products >= prev_products else "down"},
            {"label": "Categories", "value": str(total_categories), "change": "Live catalog taxonomy", "trend": "flat"},
            {"label": "Inventory Units", "value": str(float(inventory_units)), "change": "Live stock quantity", "trend": "flat"},
            {"label": "Low Stock Alerts", "value": str(low_stock_count), "change": "Live inventory threshold", "trend": "down" if low_stock_count else "flat"},
            {"label": "Inquiries", "value": str(total_inquiries), "change": f"{inquiries_change} this month", "trend": "up" if total_inquiries >= prev_inquiries else "down"},
            {"label": "Quotes", "value": str(total_quotes), "change": f"{quotes_change} this month", "trend": "up" if total_quotes >= prev_quotes else "down"},
            {"label": "Chat Sessions", "value": str(total_chats), "change": f"{chats_change} this month", "trend": "up" if total_chats >= prev_chats else "down"},
            {"label": "Website Visits", "value": str(website_visits), "change": "Tracked page views", "trend": "flat"},
            {"label": "SEO Score", "value": str(self._seo_score()), "change": "Metadata completeness", "trend": "flat"},
            {"label": "Performance Score", "value": str(self._performance_score()), "change": "API response health", "trend": "flat"},
            {"label": "API Health", "value": "Online", "change": "Django API responding", "trend": "up"},
        ]

        # ── 2. Analytics Trend (Last 7 Days) ──
        visitors_trend = []
        for i in range(6, -1, -1):
            day = now.date() - timedelta(days=i)
            count = PageView.objects.filter(timestamp__date=day).count()
            visitors_trend.append(chart_point(day.strftime("%b %d"), count))

        # Donut Chart: Sourcing/Lead channels
        whatsapp_clicks = WhatsAppClick.objects.count()
        phone_clicks = PhoneClick.objects.count()
        quote_submissions = total_quotes
        contact_submissions = total_inquiries

        conversions_mix = [
            chart_point("WhatsApp CTA", whatsapp_clicks),
            chart_point("Phone Call CTA", phone_clicks),
            chart_point("Quote Wizard", quote_submissions),
            chart_point("Contact Forms", contact_submissions),
        ]

        analytics = {
            "visitors": visitors_trend,
            "conversions": conversions_mix
        }

        # ── 3. Operational Alerts (Low stock levels) ──
        alerts = []
        # Find product stock levels
        low_stock_products = Product.objects.filter(status='active', stock_item__isnull=False)
        for p in low_stock_products:
            stock = p.stock_item
            if stock.is_low_stock:
                alerts.append({
                    "id": p.id,
                    "productName": p.name,
                    "sku": p.cas_number or f"SKU-{p.id}",
                    "stock": float(stock.quantity_on_hand),
                    "threshold": float(stock.safety_stock_level),
                    "severity": "critical" if stock.quantity_on_hand <= (stock.safety_stock_level / 2) else "warning",
                    "supplier": "Default Warehouse" if not stock.warehouse_location else stock.warehouse_location.name
                })
        # Limit to top 5 urgent alerts
        alerts = alerts[:5]

        # ── 4. Chatbot conversations ──
        conversations = []
        recent_sessions = ChatSession.objects.annotate(msg_count=Count('messages')).order_by('-updated_at')[:5]
        for session in recent_sessions:
            first_msg = session.messages.order_by('timestamp').first()
            question = first_msg.content if first_msg else "No message started"
            conversations.append({
                "id": session.session_id,
                "customerName": f"Visitor #{session.id}",
                "channel": "web",
                "question": question[:100] + "..." if len(question) > 100 else question,
                "messageCount": session.msg_count,
                "status": "resolved" if session.msg_count > 2 else "open",
                "createdAt": session.created_at.strftime("%Y-%m-%d %H:%M"),
            })

        # ── 5. Recent additions ──
        recent_products = []
        newest_products = Product.objects.all().order_by('-created_at')[:5]
        for p in newest_products:
            stock = getattr(p, 'stock_item', None)
            qty = float(stock.quantity_on_hand) if stock else 0.0
            recent_products.append({
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "category": p.category.name if p.category else "Uncategorized",
                "inventory": qty,
                "updatedAt": p.updated_at.strftime("%Y-%m-%d"),
                "status": p.status,
                "featured": p.is_featured,
                "packaging": p.packaging_type or p.unit_of_measure,
            })

        recent_blog_posts = []
        newest_posts = BlogPost.objects.all().order_by('-created_at')[:5]
        for post in newest_posts:
            recent_blog_posts.append({
                "id": post.id,
                "title": post.title,
                "author": post.author.username if post.author else (post.author_name or "Finstar Admin"),
                "status": post.status,
                "updatedAt": post.updated_at.strftime("%Y-%m-%d")
            })

        # ── 6. Activity Log ──
        activity = []
        # Construct dynamic activity log from real inquiries and updates
        recent_quotes = QuoteRequest.objects.order_by('-created_at')[:3]
        for q in recent_quotes:
            activity.append({
                "title": "New Sourcing Request",
                "description": f"Company {q.company} requested quote for {q.product.name if q.product else q.custom_product_name} ({q.quantity} {q.unit_of_measure})",
                "timestamp": q.created_at.isoformat(),
                "severity": "info",
                "id": q.id,
            })
            
        recent_messages = ContactMessage.objects.order_by('-created_at')[:3]
        for m in recent_messages:
            activity.append({
                "title": "New Contact Message",
                "description": f"{m.full_name} ({m.company or 'Individual'}) sent a general customer support request",
                "timestamp": m.created_at.isoformat(),
                "severity": "success",
                "id": m.id + 100000,
            })

        # ── 7. Quote Requests ──
        quote_requests_data = []
        for q in QuoteRequest.objects.select_related('product').order_by('-created_at')[:20]:
            quote_requests_data.append({
                "id": q.id,
                "name": q.full_name,
                "company": q.company or 'N/A',
                "product": q.product.name if q.product else (q.custom_product_name or 'Custom request'),
                "quantity": f"{q.quantity} {q.unit_of_measure}".strip(),
                "status": q.status,
                "createdAt": q.created_at.isoformat(),
                "email": getattr(q, 'email', ''),
                "phone": getattr(q, 'phone', ''),
                "notes": getattr(q, 'notes', ''),
            })

        # ── 8. Contact Inquiries ──
        inquiries_data = []
        for m in ContactMessage.objects.order_by('-created_at')[:20]:
            inquiries_data.append({
                "id": m.id,
                "name": m.full_name,
                "email": m.email,
                "company": getattr(m, 'company', None),
                "subject": str(m.message)[:80] if m.message else 'Customer inquiry',
                "status": m.status if hasattr(m, 'status') else 'pending',
                "createdAt": m.created_at.isoformat(),
                "message": m.message,
                "phone": getattr(m, 'phone', ''),
            })

        return Response({
            "metrics": metrics,
            "analytics": analytics,
            "activity": activity[:5],
            "inventoryAlerts": alerts,
            "conversations": conversations,
            "recentProducts": recent_products,
            "recentBlogPosts": recent_blog_posts,
            "quoteRequests": quote_requests_data,
            "inquiries": inquiries_data,
        }, status=status.HTTP_200_OK)

    def _seo_score(self):
        total = Product.objects.count()
        if not total:
            return 0
        complete = Product.objects.exclude(seo_title__isnull=True).exclude(seo_title='').exclude(
            seo_description__isnull=True
        ).exclude(seo_description='').exclude(image_alt__isnull=True).exclude(image_alt='').count()
        return round((complete / total) * 100)

    def _performance_score(self):
        failed_syncs = StockItem.objects.filter(sync_status='failed').count()
        return 100 if failed_syncs == 0 else max(50, 100 - (failed_syncs * 10))


class AdminAnalyticsView(APIView):
    """
    Exposes aggregated visitor, device, search term, and quote pipeline conversions
    to feed the Admin Analytics Dashboard screen.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()

        # Visitor Trend (Weekly)
        visitors_trend = []
        for i in range(6, -1, -1):
            day = now.date() - timedelta(days=i)
            count = PageView.objects.filter(timestamp__date=day).count()
            visitors_trend.append(chart_point(day.strftime("%A"), count))

        # Device Mix
        devices = PageView.objects.values('device').annotate(count=Count('id'))
        device_mix = []
        for d in devices:
            device_mix.append(chart_point(d['device'].capitalize(), d['count']))

        # Top Search Terms
        searches = SearchQuery.objects.values('query').annotate(count=Count('id')).order_by('-count')[:5]
        search_terms = []
        for s in searches:
            search_terms.append(chart_point(s['query'], s['count']))

        # Quote Stage Conversion
        quotes = QuoteRequest.objects.values('status').annotate(count=Count('id'))
        conversions = []
        for q in quotes:
            label = q['status'].replace('_', ' ').capitalize()
            conversions.append(chart_point(label, q['count']))

        top_product_pages = (
            PageView.objects.filter(page__contains='/products/')
            .values('page')
            .annotate(views=Count('id'))
            .order_by('-views')[:8]
        )
        top_viewed_products = []
        for row in top_product_pages:
            slug = row['page'].rstrip('/').split('/')[-1]
            product = Product.objects.filter(slug=slug).select_related('category').first()
            if product:
                top_viewed_products.append({
                    'id': product.id,
                    'name': product.name,
                    'category': product.category.name if product.category else 'Uncategorized',
                    'views': row['views'],
                })

        top_blog_pages = (
            PageView.objects.filter(page__contains='/blog/')
            .values('page')
            .annotate(views=Count('id'))
            .order_by('-views')[:8]
        )
        top_viewed_blog_posts = []
        for row in top_blog_pages:
            slug = row['page'].rstrip('/').split('/')[-1]
            post = BlogPost.objects.filter(slug=slug).select_related('author').first()
            if post:
                top_viewed_blog_posts.append({
                    'id': post.id,
                    'title': post.title,
                    'status': post.status,
                    'author': post.author.username if post.author else (post.author_name or 'Finstar Admin'),
                    'views': row['views'],
                })

        quote_rows = []
        for q in QuoteRequest.objects.select_related('product').order_by('-created_at')[:10]:
            quote_rows.append({
                'id': q.id,
                'name': q.full_name,
                'company': q.company or 'N/A',
                'product': q.product.name if q.product else q.custom_product_name,
                'quantity': f'{q.quantity} {q.unit_of_measure}',
                'status': q.status,
                'createdAt': q.created_at.isoformat(),
            })

        return Response({
            "visitors": visitors_trend,
            "deviceMix": device_mix,
            "searchTerms": search_terms,
            "conversions": conversions,
            "topViewedProducts": top_viewed_products,
            "topViewedBlogPosts": top_viewed_blog_posts,
            "quoteRequests": quote_rows,
        }, status=status.HTTP_200_OK)


class AdminChatbotMonitoringView(APIView):
    """
    Exposes conversational analytics list for Chatbot Monitor dashboard screen.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        sessions = ChatSession.objects.annotate(msg_count=Count('messages')).order_by('-updated_at')
        results = []
        for session in sessions:
            first_msg = session.messages.order_by('timestamp').first()
            question = first_msg.content if first_msg else "Session opened but no messages sent"
            results.append({
                "id": session.id,
                "sessionId": session.session_id,
                "customerName": f"Visitor #{session.id}",
                "channel": "Web Portal",
                "question": question[:80] + "..." if len(question) > 80 else question,
                "messageCount": session.msg_count,
                "status": "resolved" if session.msg_count > 2 else "open",
                "createdAt": session.created_at.strftime("%Y-%m-%d %H:%M")
            })
        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    """
    Exposes user management directory for Admin Users page.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        results = []
        for u in users:
            results.append({
                "id": u.id,
                "username": u.username,
                "email": u.email or "no-email@finstar.com",
                "displayName": u.get_full_name() or u.username,
                "role": "Superuser" if u.is_superuser else ("Staff" if u.is_staff else "Client Portal"),
                "status": "Active" if u.is_active else "Suspended",
                "lastLoginAt": u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else "Never"
            })
        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


class AdminBlogListView(APIView):
    """
    Exposes blog posts management directory.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        posts = BlogPost.objects.all().order_by('-updated_at')
        results = []
        for post in posts:
            results.append({
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "author": post.author.get_full_name() if post.author and post.author.get_full_name() else (post.author.username if post.author else (post.author_name or "Finstar Admin")),
                "status": post.status,
                "tags": [tag.name for tag in post.tags.all()],
                "updatedAt": post.updated_at.strftime("%Y-%m-%d %H:%M")
            })
        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


class AdminSeoListView(APIView):
    """
    Exposes SEO pages management directory.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        pages = SeoPage.objects.all().order_by('-updated_at')
        results = []
        for page in pages:
            results.append({
                "id": page.id,
                "page": page.page,
                "metaTitle": page.meta_title or "",
                "metaDescription": page.meta_description or "",
                "keywords": page.keywords_list(),
                "updatedAt": page.updated_at.strftime("%Y-%m-%d %H:%M")
            })
        return Response({
            "count": len(results),
            "results": results
        }, status=status.HTTP_200_OK)


class AdminGenerateProductContentView(APIView):
    """
    Exposes OpenAI GPT-4o vision content generation for products.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        product_name = request.data.get('productName')
        image_url = request.data.get('imageUrl')

        from services.openai_service import openai_service
        try:
            if not image_url and not product_name:
                return Response({"detail": "Upload an image or provide an image URL before generation."}, status=status.HTTP_400_BAD_REQUEST)
            generated_data = openai_service.generate_product_content(image_url=image_url, product_name=product_name)
            return Response(generated_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# Product CRUD
# ─────────────────────────────────────────────────────────────────────────────

def _parse_json_field(value):
    if not value:
        return None
    if isinstance(value, (list, dict)):
        return _json.dumps(value)
    return value


def _blank_to_none(value):
    return None if value == '' else value


def _char(value, max_length=None):
    value = _blank_to_none(value)
    if value is None:
        return None
    value = str(value)
    return value[:max_length] if max_length else value


def _parse_decimal(value, default=None):
    if value in (None, ''):
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError(f'Invalid decimal value: {value}')


def _parse_datetime_or_none(value):
    if value in (None, ''):
        return None
    parsed = parse_datetime(str(value))
    if not parsed:
        raise ValueError(f'Invalid datetime value: {value}')
    return parsed


def _as_bool(value, default=False):
    if value in (None, ''):
        return default
    if isinstance(value, bool):
        return value
    return str(value).lower() in {'1', 'true', 'yes', 'on'}


def _tag_name(value):
    if isinstance(value, dict):
        value = value.get('name') or value.get('label')
    return str(value or '').strip()


def _unique_slug(model, value):
    base = slugify(value) or 'item'
    slug = base
    index = 2
    while model.objects.filter(slug=slug).exists():
        slug = f'{base}-{index}'
        index += 1
    return slug


def _get_or_create_category(name):
    category_name = (name or '').strip()
    if not category_name:
        return None

    existing = Category.objects.filter(name__iexact=category_name).first()
    if existing:
        return existing

    return Category.objects.create(
        name=category_name,
        slug=_unique_slug(Category, category_name),
        description=f'Browse {category_name} from Finstar Industrial Chemicals for industrial buyers in Kenya, Uganda, Tanzania, and Rwanda.',
        seo_title=f'{category_name} in Kenya, Uganda, Tanzania & Rwanda | Finstar'[:90],
        seo_description=f'Find {category_name} from Finstar Industrial Chemicals for B2B procurement across Kenya, Uganda, Tanzania, and Rwanda.'[:220],
        seo_keywords=', '.join([
            category_name,
            f'{category_name} Kenya',
            f'{category_name} Uganda',
            f'{category_name} Tanzania',
            f'{category_name} Rwanda',
        ]),
    )


class AdminProductListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        qs = Product.objects.select_related('category').prefetch_related('tags').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        data = ProductListSerializer(qs, many=True, context={'request': request}).data
        return Response({'count': len(data), 'results': data})

    def post(self, request):
        d = request.data
        name = d.get('name', '').strip()
        if not name:
            return Response({'detail': 'Product name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if Product.objects.filter(name__iexact=name).exists():
            return Response(
                {'detail': f'A product named "{name}" already exists. Edit the existing product or choose a different name.'},
                status=status.HTTP_409_CONFLICT,
            )

        slug = _unique_slug(Product, d.get('slug') or name)

        # Handle category
        category = _get_or_create_category(d.get('category', ''))

        try:
            product = Product.objects.create(
                name=name, slug=slug, category=category,
                short_description=_char(d.get('short_description') or d.get('shortDescription'), 500),
                description=_blank_to_none(d.get('description')),
                long_description=_blank_to_none(d.get('long_description') or d.get('longDescription')),
                applications=_parse_json_field(d.get('applications')),
                benefits=_parse_json_field(d.get('benefits')),
                features=_parse_json_field(d.get('features')),
                industries_served=_parse_json_field(d.get('industriesServed') or d.get('industries_served')),
                faqs=_parse_json_field(d.get('faqs')),
                specifications=_parse_json_field(d.get('specifications')),
                cas_number=_char(d.get('casNumber') or d.get('cas_number'), 50),
                chemical_formula=_char(d.get('chemicalFormula') or d.get('chemical_formula'), 100),
                purity=_char(d.get('purity'), 100),
                appearance=_char(d.get('appearance'), 255),
                density=_char(d.get('density'), 100),
                packaging_type=_char(d.get('packagingType') or d.get('packaging_type'), 100),
                pricing=_char(d.get('pricing'), 255),
                min_order_quantity=_parse_decimal(d.get('minOrderQuantity') or d.get('min_order_quantity'), Decimal('1')),
                unit_of_measure=_blank_to_none(d.get('unitOfMeasure') or d.get('unit_of_measure')) or 'KG',
                hazard_classification=_blank_to_none(d.get('hazardClassification') or d.get('hazard_classification')),
                cloudinary_url=_char(d.get('cloudinaryUrl') or d.get('cloudinary_url'), 500),
                cloudinary_public_id=_char(d.get('cloudinaryPublicId') or d.get('cloudinary_public_id'), 255),
                image_alt=_char(d.get('imageAlt') or d.get('image_alt'), 125),
                image_title=_char(d.get('imageTitle') or d.get('image_title'), 125),
                image_caption=_char(d.get('imageCaption') or d.get('image_caption'), 255),
                seo_title=_char(d.get('seoTitle') or d.get('seo_title'), 90),
                seo_description=_char(d.get('seoDescription') or d.get('seo_description'), 220),
                seo_keywords=_blank_to_none(d.get('seoKeywords') or d.get('seo_keywords')),
                og_title=_char(d.get('ogTitle') or d.get('og_title'), 120),
                og_description=_char(d.get('ogDescription') or d.get('og_description'), 260),
                twitter_description=_char(d.get('twitterDescription') or d.get('twitter_description'), 260),
                schema_markup=_parse_json_field(d.get('schemaMarkup') or d.get('schema_markup')),
                whatsapp_template=_blank_to_none(d.get('whatsappTemplate') or d.get('whatsapp_template')),
                quotation_template=_blank_to_none(d.get('quotationTemplate') or d.get('quotation_template')),
                cta_content=_char(d.get('ctaContent') or d.get('cta_content'), 255),
                status=d.get('status', 'draft'),
                is_featured=_as_bool(d.get('isFeatured') if 'isFeatured' in d else d.get('is_featured'), False),
                is_new=_as_bool(d.get('isNew') if 'isNew' in d else d.get('is_new'), True),
                publish_at=_parse_datetime_or_none(d.get('publishAt') or d.get('publish_at')),
            )
        except IntegrityError:
            return Response(
                {'detail': 'A product with this name or slug already exists.'},
                status=status.HTTP_409_CONFLICT,
            )
        except (ValueError, TypeError) as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Attach tags
        tag_names = d.get('tags', [])
        if isinstance(tag_names, list):
            for tag_name in tag_names:
                tag_name = _tag_name(tag_name)
                if not tag_name:
                    continue
                tag, _ = Tag.objects.get_or_create(name=tag_name, defaults={'slug': slugify(tag_name)})
                product.tags.add(tag)

        return Response(
            ProductDetailSerializer(product, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class AdminProductDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def _get_product(self, pk):
        try:
            return Product.objects.select_related('category').prefetch_related('tags').get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self._get_product(pk)
        if not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductDetailSerializer(product, context={'request': request}).data)

    def patch(self, request, pk):
        product = self._get_product(pk)
        if not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        d = request.data
        fields_map = {
            'name': 'name', 'slug': 'slug', 'description': 'description',
            'long_description': 'long_description', 'longDescription': 'long_description',
            'short_description': 'short_description', 'shortDescription': 'short_description',
            'purity': 'purity', 'appearance': 'appearance', 'density': 'density',
            'pricing': 'pricing', 'status': 'status',
            'packaging_type': 'packaging_type', 'packagingType': 'packaging_type',
            'casNumber': 'cas_number', 'cas_number': 'cas_number',
            'chemicalFormula': 'chemical_formula', 'chemical_formula': 'chemical_formula',
            'hazardClassification': 'hazard_classification', 'hazard_classification': 'hazard_classification',
            'cloudinaryUrl': 'cloudinary_url', 'cloudinary_url': 'cloudinary_url',
            'cloudinaryPublicId': 'cloudinary_public_id', 'cloudinary_public_id': 'cloudinary_public_id',
            'imageAlt': 'image_alt', 'image_alt': 'image_alt',
            'imageTitle': 'image_title', 'image_title': 'image_title',
            'imageCaption': 'image_caption', 'image_caption': 'image_caption',
            'seoTitle': 'seo_title', 'seo_title': 'seo_title',
            'seoDescription': 'seo_description', 'seo_description': 'seo_description',
            'seoKeywords': 'seo_keywords', 'seo_keywords': 'seo_keywords',
            'ogTitle': 'og_title', 'og_title': 'og_title',
            'ogDescription': 'og_description', 'og_description': 'og_description',
            'twitterDescription': 'twitter_description', 'twitter_description': 'twitter_description',
            'whatsappTemplate': 'whatsapp_template', 'whatsapp_template': 'whatsapp_template',
            'quotationTemplate': 'quotation_template', 'quotation_template': 'quotation_template',
            'ctaContent': 'cta_content', 'cta_content': 'cta_content',
            'isFeatured': 'is_featured', 'is_featured': 'is_featured',
            'isNew': 'is_new', 'is_new': 'is_new',
            'publishAt': 'publish_at', 'publish_at': 'publish_at',
        }
        json_fields = {'applications', 'benefits', 'features', 'faqs', 'specifications',
                       'industriesServed', 'industries_served', 'schemaMarkup', 'schema_markup'}

        updated = []
        for key, model_field in fields_map.items():
            if key in d:
                setattr(product, model_field, d[key])
                updated.append(model_field)

        for key in json_fields:
            if key in d:
                model_field = {
                    'industriesServed': 'industries_served',
                    'schemaMarkup': 'schema_markup',
                }.get(key, key)
                setattr(product, model_field, _parse_json_field(d[key]))
                updated.append(model_field)

        # Handle category update
        if 'category' in d:
            cat_name = d['category']
            if cat_name:
                cat = _get_or_create_category(cat_name)
                product.category = cat
                updated.append('category')

        # Handle tags update
        if 'tags' in d:
            product.tags.clear()
            for tag_name in d.get('tags', []):
                tag, _ = Tag.objects.get_or_create(name=tag_name, defaults={'slug': slugify(tag_name)})
                product.tags.add(tag)

        if updated:
            product.save(update_fields=list(set(updated)) + ['updated_at'])

        return Response(ProductDetailSerializer(product, context={'request': request}).data)

    def delete(self, request, pk):
        product = self._get_product(pk)
        if not product:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Clean up Cloudinary if we have a public_id
        if product.cloudinary_public_id:
            try:
                from services.cloudinary_service import delete_image
                delete_image(product.cloudinary_public_id)
            except Exception:
                pass
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# Image Upload (C3)
# ─────────────────────────────────────────────────────────────────────────────
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class AdminImageUploadView(APIView):
    """Upload a file directly to Cloudinary. Returns {url, public_id}."""
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'detail': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        folder = request.data.get('folder', 'products')
        try:
            from services.cloudinary_service import upload_image, generate_variants
            result = upload_image(file_obj, folder=folder)
            result['variants'] = generate_variants(result.get('public_id'))
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminImageUrlUploadView(APIView):
    """Fetch a remote image URL into Cloudinary. Returns {url, public_id}."""
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [JSONParser]

    def post(self, request):
        image_url = request.data.get('imageUrl')
        if not image_url:
            return Response({'detail': 'imageUrl is required.'}, status=status.HTTP_400_BAD_REQUEST)
        folder = request.data.get('folder', 'products')
        try:
            from services.cloudinary_service import upload_from_url, generate_variants
            result = upload_from_url(image_url, folder=folder)
            result['variants'] = generate_variants(result.get('public_id'))
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# Category List (helper for product form dropdowns)
# ─────────────────────────────────────────────────────────────────────────────
class AdminCategoryListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        cats = Category.objects.only('id', 'name', 'slug', 'description').order_by('name')
        data = [{
            'id': c.id,
            'name': c.name,
            'slug': c.slug,
            'description': c.description or '',
            'seoTitle': getattr(c, 'seo_title', '') or '',
            'seoDescription': getattr(c, 'seo_description', '') or '',
            'seoKeywords': getattr(c, 'seo_keywords', '') or '',
        } for c in cats]
        return Response({'count': len(data), 'results': data})

    def post(self, request):
        name = (request.data.get('name') or '').strip()
        if not name:
            return Response({'detail': 'Category name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = Category.objects.filter(name__iexact=name).first()
        created = existing is None
        category = existing or Category.objects.create(
            name=name,
            slug=_unique_slug(Category, request.data.get('slug') or name),
            description=request.data.get('description', ''),
            seo_title=_char(request.data.get('seoTitle') or request.data.get('seo_title'), 90),
            seo_description=_char(request.data.get('seoDescription') or request.data.get('seo_description'), 220),
            seo_keywords=_blank_to_none(request.data.get('seoKeywords') or request.data.get('seo_keywords')),
        )
        if not created:
            category.name = name
            category.description = request.data.get('description', category.description)
            category.seo_title = _char(request.data.get('seoTitle') or request.data.get('seo_title'), 90) or category.seo_title
            category.seo_description = _char(request.data.get('seoDescription') or request.data.get('seo_description'), 220) or category.seo_description
            category.seo_keywords = _blank_to_none(request.data.get('seoKeywords') or request.data.get('seo_keywords')) or category.seo_keywords
            category.save(update_fields=['name', 'description', 'seo_title', 'seo_description', 'seo_keywords'])

        return Response(
            {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'description': category.description or '',
                'seoTitle': category.seo_title or '',
                'seoDescription': category.seo_description or '',
                'seoKeywords': category.seo_keywords or '',
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Enhanced Chatbot Analytics (C6)
# ─────────────────────────────────────────────────────────────────────────────
class AdminChatbotAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()

        total_sessions = ChatSession.objects.count()
        total_messages = ChatMessage.objects.count()
        avg_messages = round(total_messages / total_sessions, 1) if total_sessions else 0

        # Daily sessions last 7 days
        daily_trend = []
        for i in range(6, -1, -1):
            day = now.date() - timedelta(days=i)
            count = ChatSession.objects.filter(created_at__date=day).count()
            daily_trend.append({'label': day.strftime('%b %d'), 'value': count})

        # Most asked questions (first user message per session)
        from django.db.models import F
        first_messages = (
            ChatMessage.objects
            .filter(role='user')
            .values('content')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        top_questions = [{'question': m['content'][:120], 'count': m['count']} for m in first_messages]

        # Most mentioned products in AI responses
        products = Product.objects.filter(status='active')
        mentioned = []
        for p in products:
            count = ChatMessage.objects.filter(role='assistant', content__icontains=p.name).count()
            if count > 0:
                mentioned.append({'name': p.name, 'slug': p.slug, 'count': count,
                                  'image': p.get_primary_image_url()})
        mentioned.sort(key=lambda x: x['count'], reverse=True)

        # Conversations list
        sessions = ChatSession.objects.annotate(msg_count=Count('messages')).order_by('-updated_at')[:20]
        conversations = []
        for s in sessions:
            first = s.messages.order_by('timestamp').first()
            q = first.content if first else 'No messages'
            conversations.append({
                'id': s.id,
                'sessionId': s.session_id,
                'customerName': f'Visitor #{s.id}',
                'channel': 'Web Portal',
                'question': q[:100],
                'messageCount': s.msg_count,
                'status': 'resolved' if s.msg_count > 2 else 'open',
                'createdAt': s.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return Response({
            'totalSessions': total_sessions,
            'totalMessages': total_messages,
            'avgMessagesPerSession': avg_messages,
            'dailyTrend': daily_trend,
            'topQuestions': top_questions,
            'mentionedProducts': mentioned[:8],
            'conversations': conversations,
            'count': len(conversations),
            'results': conversations,
        })
