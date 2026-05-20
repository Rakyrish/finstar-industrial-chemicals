from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, ContactMessageViewSet

router = DefaultRouter()
router.register('quotes', QuoteRequestViewSet, basename='quote')
router.register('contact', ContactMessageViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
