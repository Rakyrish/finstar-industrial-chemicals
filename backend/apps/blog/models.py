from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()


class BlogCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or 'category'
            slug = base
            index = 2
            while BlogCategory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{index}'
                index += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name) or 'tag'
            slug = base
            index = 2
            while BlogTag.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{index}'
                index += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('archived',  'Archived'),
    ]

    # ── Core Content ──────────────────────────────────────────────────────────
    title   = models.CharField(max_length=200, help_text='Max 70 chars for SEO. Shown with counter in admin.')
    slug    = models.SlugField(max_length=220, unique=True, blank=True)
    excerpt = models.TextField(max_length=300, blank=True, null=True, help_text='Max 300 chars. Shown on blog cards.')
    content = models.TextField(help_text='Full HTML article body.')

    # FAQ stored as JSON list: [{"question": "...", "answer": "..."}]
    faq_json = models.TextField(blank=True, default='[]', help_text='JSON array of FAQ items.')

    # ── Authorship ────────────────────────────────────────────────────────────
    author      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='blog_posts'
    )
    author_name = models.CharField(
        max_length=255, blank=True, null=True, help_text='Override display name (used for AI-generated posts).'
    )

    # ── Taxonomy ──────────────────────────────────────────────────────────────
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts'
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')

    # ── Relations ─────────────────────────────────────────────────────────────
    related_products = models.ManyToManyField(
        'products.Product', blank=True, related_name='blog_posts'
    )
    related_services = models.ManyToManyField(
        'products.Service', blank=True, related_name='blog_posts'
    )
    # related_docs back-filled via TechnicalDocument.related_blogs M2M

    # ── Media ─────────────────────────────────────────────────────────────────
    cover_image_url       = models.URLField(max_length=1000, blank=True, null=True)
    cover_image_public_id = models.CharField(max_length=500, blank=True, null=True)
    cover_image_alt       = models.CharField(max_length=200, blank=True, null=True, help_text='Alt text for featured image.')
    og_image_url          = models.URLField(max_length=1000, blank=True, null=True, help_text='Falls back to cover_image_url if empty.')

    # ── SEO ───────────────────────────────────────────────────────────────────
    meta_title       = models.CharField(max_length=70, blank=True, null=True, help_text='Falls back to title if empty.')
    meta_description = models.CharField(max_length=160, blank=True, null=True, help_text='Max 160 chars.')
    og_description   = models.CharField(max_length=300, blank=True, null=True)

    # Legacy compatibility fields
    seo_title       = models.CharField(max_length=255, blank=True, null=True)  # kept for backward compat
    seo_description = models.CharField(max_length=500, blank=True, null=True)  # kept for backward compat

    # ── Publishing ────────────────────────────────────────────────────────────
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    scheduled_at = models.DateTimeField(null=True, blank=True, help_text='UTC time for scheduled posts. Displayed as EAT in admin.')
    published_at = models.DateTimeField(null=True, blank=True)

    # ── Engagement ────────────────────────────────────────────────────────────
    is_featured  = models.BooleanField(default=False, help_text='Pin to homepage hero section.')
    reading_time = models.PositiveIntegerField(default=5, help_text='Estimated reading time in minutes.')
    views        = models.PositiveIntegerField(default=0, editable=False)
    quality_score = models.PositiveSmallIntegerField(
        default=0, help_text='0–100 score from Content Quality Engine. Must be ≥80 to publish.'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or 'post'
            slug = base
            index = 2
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{index}'
                index += 1
            self.slug = slug

        # Auto-calculate reading time from word count
        if self.content:
            word_count = len(self.content.split())
            self.reading_time = max(1, round(word_count / 200))

        # Populate legacy SEO fields from new fields for backward compat
        if not self.seo_title and self.meta_title:
            self.seo_title = self.meta_title
        if not self.seo_description and self.meta_description:
            self.seo_description = self.meta_description

        super().save(*args, **kwargs)

    def get_meta_title(self):
        return self.meta_title or self.seo_title or self.title

    def get_og_image(self):
        return self.og_image_url or self.cover_image_url

    def __str__(self):
        return self.title


class BlogGenerationLog(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed',  'Failed'),
        ('retry',   'Retried'),
    ]
    TRIGGER_CHOICES = [
        ('scheduler', 'Celery Scheduler'),
        ('admin',     'Admin Dashboard'),
        ('seed',      'Deployment Seed'),
    ]

    blog         = models.ForeignKey(
        BlogPost, on_delete=models.SET_NULL, null=True, blank=True, related_name='generation_logs'
    )
    triggered_by = models.CharField(max_length=20, choices=TRIGGER_CHOICES, default='admin')
    topic_used   = models.TextField()
    tokens_used  = models.PositiveIntegerField(default=0)
    quality_score = models.PositiveIntegerField(default=0)
    retries      = models.PositiveIntegerField(default=0)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success')
    error_log    = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.triggered_by}] {self.topic_used[:60]} — {self.status}'
