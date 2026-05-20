from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WarehouseLocation, StockItem
from .serializers import WarehouseLocationSerializer, StockItemSerializer


class WarehouseLocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WarehouseLocation.objects.all()
    serializer_class = WarehouseLocationSerializer


class StockItemViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer

    def get_queryset(self):
        queryset = StockItem.objects.all()
        
        # Filter low stock items directly
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock is not None:
            queryset = [item for item in queryset if item.is_low_stock]
            
        return queryset

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        items = [item for item in StockItem.objects.all() if item.is_low_stock]
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def force_sync(self, request, pk=None):
        stock_item = self.get_object()
        
        # Trigger real-time inventory sheets sync logic
        # For now, simulate trigger by updating status to synchronized
        stock_item.sync_status = 'synchronized'
        stock_item.save()
        
        return Response({
            'status': 'Sync triggered successfully',
            'product': stock_item.product.name,
            'current_quantity': stock_item.quantity_on_hand
        }, status=status.HTTP_200_OK)
