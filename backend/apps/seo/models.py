from django.db import models


class SeoPage(models.Model):
    """Page-level SEO configuration managed from the admin dashboard."""
    page = models.CharField(
        max_length=500,
        unique=True,
        help_text='Page path or identifier, e.g. "home", "/products/acetone"',
    )
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.CharField(max_length=500, blank=True, null=True)
    og_title = models.CharField(max_length=255, blank=True, null=True)
    og_description = models.CharField(max_length=500, blank=True, null=True)
    og_image_url = models.URLField(max_length=1000, blank=True, null=True)
    keywords = models.TextField(
        blank=True,
        null=True,
        help_text='Comma-separated keywords',
    )
    canonical_url = models.URLField(max_length=1000, blank=True, null=True)
    structured_data = models.JSONField(
        blank=True,
        null=True,
        help_text='Raw JSON-LD structured data object',
    )
    robots = models.CharField(
        max_length=100,
        default='index, follow',
        help_text='Robots meta tag value',
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page']
        verbose_name = 'SEO Page'
        verbose_name_plural = 'SEO Pages'

    def keywords_list(self):
        if not self.keywords:
            return []
        return [k.strip() for k in self.keywords.split(',') if k.strip()]

    def __str__(self):
        return self.page
