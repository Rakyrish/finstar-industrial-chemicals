from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SeoPageViewSet

router = DefaultRouter()
router.register('pages', SeoPageViewSet, basename='seo-page')

urlpatterns = [
    path('', include(router.urls)),
]
