from django.db import models


class Lead(models.Model):
    SOURCE_CHOICES = [
        ('contact_form', 'Contact Form'),
        ('quote_request', 'Quote Request'),
        ('chatbot', 'Chatbot'),
        ('whatsapp', 'WhatsApp'),
        ('phone', 'Phone Call'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)

    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='other')
    source_page = models.CharField(max_length=500, blank=True, null=True)
    referrer = models.CharField(max_length=1000, blank=True, null=True)

    # Optional link to quote/contact
    quote_request_id = models.IntegerField(null=True, blank=True)
    contact_message_id = models.IntegerField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True, null=True)
    assigned_to = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.source}) — {self.status}'
