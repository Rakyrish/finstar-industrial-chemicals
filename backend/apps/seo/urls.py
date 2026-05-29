from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SeoPageViewSet, SiteSettingsView

router = DefaultRouter()
router.register('pages', SeoPageViewSet, basename='seo-page')

urlpatterns = [
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('', include(router.urls)),
]
