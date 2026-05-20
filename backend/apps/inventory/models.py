from django.db import models
from products.models import Product


class WarehouseLocation(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class StockItem(models.Model):
    SYNC_STATUS_CHOICES = [
        ('synchronized', 'Synchronized'),
        ('pending', 'Pending Sync'),
        ('failed', 'Sync Failed'),
    ]

    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stock_item')
    warehouse_location = models.ForeignKey(WarehouseLocation, on_delete=models.SET_NULL, null=True, related_name='stock_items')
    quantity_on_hand = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    safety_stock_level = models.DecimalField(max_digits=12, decimal_places=2, default=100.00)
    
    # Tracking Google Sheets sync parameters
    last_synced = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=30, choices=SYNC_STATUS_CHOICES, default='synchronized')
    last_error_log = models.TextField(blank=True, null=True)
    
    last_updated = models.DateTimeField(auto_now=True)

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.safety_stock_level

    def __str__(self):
        return f"{self.product.name} — {self.quantity_on_hand} {self.product.unit_of_measure} at {self.warehouse_location.code if self.warehouse_location else 'N/A'}"
