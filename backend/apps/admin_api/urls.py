from django.urls import path
from .views import (
    AdminOverviewView,
    AdminAnalyticsView,
    AdminChatbotMonitoringView,
    AdminUserListView,
    AdminBlogListView,
    AdminSeoListView,
    AdminGenerateProductContentView,
    AdminProductListView,
    AdminProductDetailView,
    AdminImageUploadView,
    AdminImageUrlUploadView,
    AdminCategoryListView,
    AdminChatbotAnalyticsView,
    # SEO endpoints
    AdminProductSeoRegenerateView,
    AdminProductBulkSeoRegenerateView,
    AdminSitemapPingView,
    AdminSeoScoreView,
)

urlpatterns = [
    # Dashboard & analytics
    path('overview/', AdminOverviewView.as_view(), name='admin-overview'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),

    # Products CRUD
    path('products/', AdminProductListView.as_view(), name='admin-products'),
    path('products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('categories/', AdminCategoryListView.as_view(), name='admin-categories'),

    # Image upload
    path('upload-image/', AdminImageUploadView.as_view(), name='admin-upload-image'),
    path('upload-image-url/', AdminImageUrlUploadView.as_view(), name='admin-upload-image-url'),

    # AI generation
    path('ai/generate-product/', AdminGenerateProductContentView.as_view(), name='admin-ai-generate-product'),

    # Chatbot
    path('chatbot/', AdminChatbotMonitoringView.as_view(), name='admin-chatbot'),
    path('chatbot/analytics/', AdminChatbotAnalyticsView.as_view(), name='admin-chatbot-analytics'),

    # Users, Blog, SEO pages
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('blog/', AdminBlogListView.as_view(), name='admin-blog'),
    path('seo/', AdminSeoListView.as_view(), name='admin-seo'),

    # ── SEO auto-generation & scoring ────────────────────────────────────────
    # Per-product SEO regeneration
    path('products/<int:pk>/regenerate-seo/', AdminProductSeoRegenerateView.as_view(), name='admin-product-regenerate-seo'),
    # Batch: regenerate all products missing SEO fields
    path('products/bulk-regenerate-seo/', AdminProductBulkSeoRegenerateView.as_view(), name='admin-products-bulk-seo'),
    # Ping Google + Bing with sitemap
    path('sitemap/ping/', AdminSitemapPingView.as_view(), name='admin-sitemap-ping'),
    # SEO score per product
    path('seo/score/', AdminSeoScoreView.as_view(), name='admin-seo-score'),
]
