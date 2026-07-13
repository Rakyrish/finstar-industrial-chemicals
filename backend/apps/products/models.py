import json
from django.db import models
from django.utils.text import slugify

# ── SEO auto-generation helpers ───────────────────────────────────────────────
from django.conf import settings

EAST_AFRICA_MARKETS = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'East Africa']
SITE_NAME = getattr(settings, 'COMPANY_NAME', 'Finstar Industrial Chemicals')
SITE_BRAND = getattr(settings, 'COMPANY_BRAND_NAME', 'Finstar')


def _auto_seo_title(name: str, category_name: str) -> str:
    """Generate keyword-rich 60-char SEO title."""
    cat = category_name or 'Industrial Chemical'
    title = f'{name} — {cat} Supplier Kenya & East Africa | {SITE_BRAND}'
    return title[:90]


def _auto_seo_description(name: str, short_desc: str, category_name: str) -> str:
    """Generate 155-char meta description from product data."""
    cat = category_name or 'industrial chemicals'
    base = short_desc.strip()[:80] if short_desc else ''
    if base:
        desc = (
            f'Buy {name} from {SITE_BRAND} — trusted {cat} supplier in Kenya, '
            f'Uganda, Tanzania & Rwanda. {base} Request a bulk quote today.'
        )
    else:
        desc = (
            f'Source {name} ({cat}) from {SITE_BRAND}. Bulk supply to industrial '
            f'buyers across Kenya, Uganda, Tanzania, and Rwanda. Request a quote.'
        )
    return desc[:220]


def _auto_keywords(name: str, category_name: str) -> str:
    """Generate comma-separated keyword string."""
    cat = category_name or 'industrial chemical'
    kws = [
        name,
        f'{name} supplier',
        f'buy {name}',
        f'{name} Kenya',
        f'{name} Uganda',
        f'{name} Tanzania',
        f'{name} East Africa',
        cat,
        f'{cat} supplier Kenya',
        f'{SITE_BRAND} {name}',
        'industrial chemicals Kenya',
        'chemical supplier East Africa',
    ]
    return ', '.join(kws)


def _auto_image_alt(name: str, category_name: str) -> str:
    cat = category_name or 'industrial chemical'
    return f'{name} — {cat} by {SITE_BRAND}'[:125]


def _auto_schema_markup(product) -> str:
    """Generate minimal Product JSON-LD string for storage."""
    base_url = getattr(settings, 'SITE_URL', '').rstrip('/')
    cat = product.category.name if product.category else 'Industrial Chemical'
    avail = (
        'https://schema.org/InStock'
        if product.status == 'active'
        else 'https://schema.org/OutOfStock'
    )
    schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': product.short_description or product.description or product.name,
        'image': product.cloudinary_url or '',
        'sku': product.cas_number or str(product.pk or ''),
        'brand': {'@type': 'Brand', 'name': SITE_NAME},
        'manufacturer': {
            '@type': 'Organization',
            'name': SITE_NAME,
            'url': base_url,
        },
        'category': cat,
        'url': f'{base_url}/products/{product.slug}' if base_url else '',
        'offers': {
            '@type': 'Offer',
            'availability': avail,
            'itemCondition': 'https://schema.org/NewCondition',
            'priceCurrency': 'KES',
            'seller': {'@type': 'Organization', 'name': SITE_NAME},
            'areaServed': EAST_AFRICA_MARKETS,
        },
    }
    return json.dumps(schema)


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    seo_title = models.CharField(max_length=90, blank=True, null=True)
    seo_description = models.CharField(max_length=220, blank=True, null=True)
    seo_keywords = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Service(models.Model):
    """
    Represents a Finstar service offering (e.g. Chemical Testing, Bulk Delivery, Blending).
    Used for M2M associations on blog posts and technical documents.
    """
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active / Available'),
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('out_of_stock', 'Out of Stock'),
        ('discontinued', 'Discontinued'),
    ]

    # ── Core Identity ─────────────────────────────────────────────────────────
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products'
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name='products')

    # ── Descriptions ──────────────────────────────────────────────────────────
    short_description = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)           # legacy / medium
    long_description = models.TextField(blank=True, null=True)      # rich long-form

    # ── Structured Content (stored as JSON strings) ───────────────────────────
    applications = models.TextField(blank=True, null=True)          # JSON list of strings
    benefits = models.TextField(blank=True, null=True)              # JSON list of strings
    features = models.TextField(blank=True, null=True)              # JSON list of strings
    industries_served = models.TextField(blank=True, null=True)     # JSON list of strings
    faqs = models.TextField(blank=True, null=True)                  # JSON [{q,a}]

    # ── Technical Specifications ──────────────────────────────────────────────
    cas_number = models.CharField(max_length=50, blank=True, null=True, verbose_name='CAS Number')
    chemical_formula = models.CharField(max_length=100, blank=True, null=True)
    purity = models.CharField(max_length=100, blank=True, null=True)
    appearance = models.CharField(max_length=255, blank=True, null=True)
    density = models.CharField(max_length=100, blank=True, null=True)
    specifications = models.TextField(blank=True, null=True)        # JSON [{key,value}]

    # ── Logistics / Volumes ───────────────────────────────────────────────────
    packaging_type = models.CharField(max_length=100, blank=True, null=True)
    pricing = models.CharField(max_length=255, blank=True, null=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    min_order_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    unit_of_measure = models.CharField(max_length=50, default='KG')

    # ── Media / Images ────────────────────────────────────────────────────────
    primary_image = models.ImageField(upload_to='products/', blank=True, null=True)
    cloudinary_url = models.URLField(max_length=500, blank=True, null=True)
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    image_alt = models.CharField(max_length=125, blank=True, null=True)
    image_title = models.CharField(max_length=125, blank=True, null=True)
    image_caption = models.CharField(max_length=255, blank=True, null=True)

    # ── SEO ───────────────────────────────────────────────────────────────────
    seo_title = models.CharField(max_length=90, blank=True, null=True)
    seo_description = models.CharField(max_length=220, blank=True, null=True)
    seo_keywords = models.TextField(blank=True, null=True)          # comma-separated
    og_title = models.CharField(max_length=120, blank=True, null=True)
    og_description = models.CharField(max_length=260, blank=True, null=True)
    twitter_description = models.CharField(max_length=260, blank=True, null=True)
    schema_markup = models.TextField(blank=True, null=True)         # JSON-LD string

    # ── Engagement Templates ──────────────────────────────────────────────────
    whatsapp_template = models.TextField(blank=True, null=True)
    quotation_template = models.TextField(blank=True, null=True)
    cta_content = models.CharField(max_length=255, blank=True, null=True)

    # ── Hazard / Compliance ───────────────────────────────────────────────────
    hazard_classification = models.TextField(
        blank=True, null=True, verbose_name='Hazard Identification / PPE rules'
    )

    # ── Image protection / watermark state ────────────────────────────────────
    is_watermark_applied = models.BooleanField(default=False)
    watermark_applied_at = models.DateTimeField(blank=True, null=True)
    last_restored_at = models.DateTimeField(blank=True, null=True)

    # ── Flags & Publishing ────────────────────────────────────────────────────
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    publish_at = models.DateTimeField(blank=True, null=True)
    published_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        # ── Auto-generate SEO fields if blank ────────────────────────────────
        cat_name = self.category.name if self.category else ''

        if not self.seo_title:
            self.seo_title = _auto_seo_title(self.name, cat_name)

        if not self.seo_description:
            self.seo_description = _auto_seo_description(
                self.name, self.short_description or '', cat_name
            )

        if not self.seo_keywords:
            self.seo_keywords = _auto_keywords(self.name, cat_name)

        if not self.image_alt:
            self.image_alt = _auto_image_alt(self.name, cat_name)

        if not self.image_title:
            self.image_title = f'{self.name} — {SITE_BRAND}'[:125]

        if not self.og_title:
            self.og_title = self.seo_title[:120]

        if not self.og_description:
            self.og_description = self.seo_description[:260]

        if not self.twitter_description:
            self.twitter_description = self.seo_description[:260]

        if not self.whatsapp_template:
            self.whatsapp_template = (
                f'Hello {SITE_BRAND}, I am interested in {self.name}. '
                f'Please send availability and quotation details.'
            )

        if not self.cta_content:
            self.cta_content = (
                f'{self.name} is available from {SITE_BRAND} for industrial buyers, '
                f'manufacturers, and procurement teams across Kenya, Uganda, Tanzania, and Rwanda.'
            )[:255]

        super().save(*args, **kwargs)

        # Regenerate schema_markup after save (pk is now available)
        if not self.schema_markup:
            self.__class__.objects.filter(pk=self.pk).update(
                schema_markup=_auto_schema_markup(self)
            )


    # ── Helpers for JSON fields ───────────────────────────────────────────────
    def get_applications(self):
        try:
            return json.loads(self.applications) if self.applications else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_benefits(self):
        try:
            return json.loads(self.benefits) if self.benefits else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_features(self):
        try:
            return json.loads(self.features) if self.features else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_industries_served(self):
        try:
            return json.loads(self.industries_served) if self.industries_served else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_faqs(self):
        try:
            return json.loads(self.faqs) if self.faqs else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_specifications(self):
        try:
            return json.loads(self.specifications) if self.specifications else []
        except (json.JSONDecodeError, TypeError):
            return []

    def get_primary_image_url(self):
        """Return Cloudinary URL first, then fall back to local media."""
        if self.cloudinary_url:
            return self.cloudinary_url
        if self.primary_image:
            return self.primary_image.url
        return None

    def get_effective_image_url(self):
        """
        The URL that should actually be served to visitors.

        The watermark is never baked into the stored asset — it's a Cloudinary
        on-the-fly transformation computed against `cloudinary_public_id`.
        Both the global switch AND the per-product flag must be on for the
        transformed URL to be served; otherwise the original is returned.
        """
        if self.is_watermark_applied and self.cloudinary_public_id:
            from watermark.models import WatermarkSettings
            from watermark.cloudinary_utils import build_watermark_url

            settings_row = WatermarkSettings.get_solo()
            if settings_row.watermark_enabled:
                return build_watermark_url(self.cloudinary_public_id, settings_row)
        return self.get_primary_image_url()

    def get_effective_image_alt(self):
        """
        Strip descriptive alt/title metadata on actively-protected images when
        SEO metadata protection is on, to reduce reverse-image-search/scraping
        surface area. Falls back to the normal descriptive alt text otherwise.
        """
        if self.is_watermark_applied:
            from watermark.models import WatermarkSettings

            settings_row = WatermarkSettings.get_solo()
            if settings_row.watermark_enabled and settings_row.seo_metadata_protection_enabled:
                return self.name
        return self.image_alt or ''

    def __str__(self):
        return self.name
