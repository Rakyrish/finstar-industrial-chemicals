import uuid

from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

SETTINGS_CACHE_KEY = 'watermark:settings:solo'
SETTINGS_CACHE_TTL = 30  # seconds


class WatermarkSettings(models.Model):
    """
    Site-wide singleton (always pk=1) controlling image protection & watermarking.
    Every toggle defaults to False/off — turning this on live is always an
    explicit admin action, never a surprise on a live site.
    """
    POSITION_CHOICES = [
        ('center', 'Center (single stamp)'),
        ('tiled', 'Tiled (repeated diagonal pattern)'),
    ]

    # ── Master switches (all default OFF) ───────────────────────────────────
    watermark_enabled = models.BooleanField(default=False)
    right_click_protection_enabled = models.BooleanField(default=False)
    drag_protection_enabled = models.BooleanField(default=False)
    long_press_protection_enabled = models.BooleanField(default=False)
    seo_metadata_protection_enabled = models.BooleanField(default=False)

    # ── Watermark design ─────────────────────────────────────────────────────
    watermark_text = models.CharField(max_length=120, blank=True, default='Finstar Industrial Chemicals')
    watermark_secondary_text = models.CharField(max_length=120, blank=True, default='')
    watermark_opacity = models.PositiveSmallIntegerField(
        default=20, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    watermark_font_size = models.PositiveSmallIntegerField(default=32)
    watermark_angle = models.SmallIntegerField(
        default=-30, validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    watermark_position = models.CharField(max_length=10, choices=POSITION_CHOICES, default='tiled')
    watermark_color = models.CharField(max_length=20, default='#FFFFFF')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Watermark settings'
        verbose_name_plural = 'Watermark settings'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
        cache.set(SETTINGS_CACHE_KEY, self, SETTINGS_CACHE_TTL)

    def delete(self, *args, **kwargs):
        pass  # singleton — never actually delete

    @classmethod
    def get_solo(cls):
        cached = cache.get(SETTINGS_CACHE_KEY)
        if cached is not None:
            return cached
        obj, _ = cls.objects.get_or_create(pk=1)
        cache.set(SETTINGS_CACHE_KEY, obj, SETTINGS_CACHE_TTL)
        return obj

    def __str__(self):
        return 'Watermark settings'


class WatermarkBatch(models.Model):
    SCOPE_CHOICES = [
        ('all', 'All active products'),
        ('category', 'By category'),
        ('tag', 'By tag'),
        ('never_protected', 'Never protected yet'),
    ]
    ACTION_CHOICES = [
        ('apply', 'Apply watermark'),
        ('restore', 'Restore original'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    batch_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scope_type = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    scope_value = models.CharField(max_length=255, blank=True, default='')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    total_matched = models.PositiveIntegerField(default=0)
    queued_count = models.PositiveIntegerField(default=0)
    skipped_count = models.PositiveIntegerField(default=0)

    created_by = models.ForeignKey(
        'auth.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='watermark_batches'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} — {self.get_scope_type_display()} ({self.status})'


class WatermarkJob(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    batch = models.ForeignKey(WatermarkBatch, on_delete=models.CASCADE, related_name='jobs')
    product = models.ForeignKey(
        'products.Product', on_delete=models.CASCADE, related_name='watermark_jobs'
    )
    action = models.CharField(max_length=10, choices=WatermarkBatch.ACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=3)
    next_attempt_at = models.DateTimeField(auto_now_add=True)
    last_error = models.TextField(blank=True, default='')

    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'next_attempt_at']),
            models.Index(fields=['batch', 'status']),
        ]

    def __str__(self):
        return f'{self.action} {self.product_id} — {self.status}'
