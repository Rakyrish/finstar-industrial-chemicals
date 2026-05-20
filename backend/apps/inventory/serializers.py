from rest_framework import serializers
from .models import WarehouseLocation, StockItem
from products.serializers import ProductListSerializer


class WarehouseLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseLocation
        fields = ['id', 'name', 'code', 'address']


class StockItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    warehouseLocation = WarehouseLocationSerializer(source='warehouse_location', read_only=True)
    quantityOnHand = serializers.DecimalField(source='quantity_on_hand', max_digits=12, decimal_places=2)
    safetyStockLevel = serializers.DecimalField(source='safety_stock_level', max_digits=12, decimal_places=2)
    isLowStock = serializers.BooleanField(source='is_low_stock', read_only=True)
    lastSynced = serializers.DateTimeField(source='last_synced', read_only=True)
    syncStatus = serializers.CharField(source='sync_status', read_only=True)

    class Meta:
        model = StockItem
        fields = [
            'id', 'product', 'warehouseLocation', 'quantityOnHand', 
            'safetyStockLevel', 'isLowStock', 'lastSynced', 'syncStatus', 
            'last_updated'
        ]
