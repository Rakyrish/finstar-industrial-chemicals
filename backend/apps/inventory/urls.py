from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WarehouseLocationViewSet, StockItemViewSet

router = DefaultRouter()
router.register('warehouses', WarehouseLocationViewSet, basename='warehouse')
router.register('stocks', StockItemViewSet, basename='stock')

urlpatterns = [
    path('', include(router.urls)),
]
