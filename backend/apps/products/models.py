import json
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
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
    seo_title = models.CharField(max_length=70, blank=True, null=True)
    seo_description = models.CharField(max_length=160, blank=True, null=True)
    seo_keywords = models.TextField(blank=True, null=True)          # comma-separated
    og_title = models.CharField(max_length=95, blank=True, null=True)
    og_description = models.CharField(max_length=200, blank=True, null=True)
    twitter_description = models.CharField(max_length=200, blank=True, null=True)
    schema_markup = models.TextField(blank=True, null=True)         # JSON-LD string

    # ── Engagement Templates ──────────────────────────────────────────────────
    whatsapp_template = models.TextField(blank=True, null=True)
    quotation_template = models.TextField(blank=True, null=True)
    cta_content = models.CharField(max_length=255, blank=True, null=True)

    # ── Hazard / Compliance ───────────────────────────────────────────────────
    hazard_classification = models.TextField(
        blank=True, null=True, verbose_name='Hazard Identification / PPE rules'
    )

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
        super().save(*args, **kwargs)

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

    def __str__(self):
        return self.name
