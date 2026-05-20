from django.db import models
from products.models import Product


class QuoteRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('drafted', 'Quote Drafted'),
        ('sent', 'Sent to Client'),
        ('rejected', 'Rejected / Cancelled'),
    ]

    # Product references
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='quote_requests')
    custom_product_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Specs
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_of_measure = models.CharField(max_length=50, default='KG')
    purity_required = models.CharField(max_length=150, default='Technical Grade')
    packaging_preference = models.CharField(max_length=150, default='IBC Tote (1000L)')
    target_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    need_msds = models.BooleanField(default=True)
    need_coa = models.BooleanField(default=True)
    
    # Client Sourcing Info
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    company = models.CharField(max_length=255)
    delivery_address = models.TextField(blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    
    # Pricing Office admin state
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    quoted_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    assigned_sales_rep = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        prod_name = self.product.name if self.product else self.custom_product_name
        return f"Quote #{self.id} — {prod_name} for {self.company}"


class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]

    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.full_name} ({self.company if self.company else 'Individual'})"
