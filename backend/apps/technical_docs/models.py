from django.db import models
from django.utils.text import slugify


class TechnicalDocument(models.Model):
    DOC_TYPES = [
        ('datasheet',   'Product Data Sheet'),
        ('iso_guide',   'ISO Standard Guide'),
        ('kebs_guide',  'KEBS Compliance Guide'),
        ('iec_guide',   'IEC Standard Guide'),
        ('case_study',  'Case Study'),
        ('whitepaper',  'Technical Whitepaper'),
    ]

    title            = models.CharField(max_length=200)
    slug             = models.SlugField(max_length=220, unique=True, blank=True)
    doc_type         = models.CharField(max_length=30, choices=DOC_TYPES, default='datasheet', db_index=True)

    # Standard reference e.g. "ISO 9001:2015", "KEBS KS 04-136", "IEC 60204-1"
    standard_code    = models.CharField(max_length=80, blank=True)

    # SEO
    meta_title       = models.CharField(max_length=70, blank=True)
    meta_description = models.TextField(max_length=160, blank=True)
    excerpt          = models.TextField(max_length=300)
    body_html        = models.TextField()

    # Optional manually-uploaded PDF (takes priority over generated-on-demand PDF)
    pdf_file         = models.FileField(upload_to='tech-docs/pdfs/', blank=True, null=True)

    # Relations
    related_products = models.ManyToManyField(
        'products.Product', blank=True, related_name='technical_docs'
    )
    related_blogs    = models.ManyToManyField(
        'blog.BlogPost', blank=True, related_name='technical_docs'
    )

    # Flags & tracking
    is_published     = models.BooleanField(default=False, db_index=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)
    view_count       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or 'document'
            slug = base
            index = 2
            while TechnicalDocument.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{index}'
                index += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f'[{self.get_doc_type_display()}] {self.title}'
