from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogCategoryViewSet, BlogTagViewSet, BlogPostViewSet

router = DefaultRouter()
router.register('categories', BlogCategoryViewSet, basename='blog-category')
router.register('tags', BlogTagViewSet, basename='blog-tag')
router.register('posts', BlogPostViewSet, basename='blog-post')

urlpatterns = [
    path('', include(router.urls)),
]
