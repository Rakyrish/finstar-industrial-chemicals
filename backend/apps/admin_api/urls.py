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
    path('overview', AdminOverviewView.as_view(), name='admin-overview-noslash'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('analytics', AdminAnalyticsView.as_view(), name='admin-analytics-noslash'),

    # Products CRUD
    path('products/', AdminProductListView.as_view(), name='admin-products'),
    path('products', AdminProductListView.as_view(), name='admin-products-noslash'),
    path('products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('products/<int:pk>', AdminProductDetailView.as_view(), name='admin-product-detail-noslash'),
    path('categories/', AdminCategoryListView.as_view(), name='admin-categories'),
    path('categories', AdminCategoryListView.as_view(), name='admin-categories-noslash'),

    # Image upload
    path('upload-image/', AdminImageUploadView.as_view(), name='admin-upload-image'),
    path('upload-image', AdminImageUploadView.as_view(), name='admin-upload-image-noslash'),
    path('upload-image-url/', AdminImageUrlUploadView.as_view(), name='admin-upload-image-url'),
    path('upload-image-url', AdminImageUrlUploadView.as_view(), name='admin-upload-image-url-noslash'),

    # AI generation
    path('ai/generate-product/', AdminGenerateProductContentView.as_view(), name='admin-ai-generate-product'),
    path('ai/generate-product', AdminGenerateProductContentView.as_view(), name='admin-ai-generate-product-noslash'),

    # Chatbot
    path('chatbot/', AdminChatbotMonitoringView.as_view(), name='admin-chatbot'),
    path('chatbot', AdminChatbotMonitoringView.as_view(), name='admin-chatbot-noslash'),
    path('chatbot/analytics/', AdminChatbotAnalyticsView.as_view(), name='admin-chatbot-analytics'),
    path('chatbot/analytics', AdminChatbotAnalyticsView.as_view(), name='admin-chatbot-analytics-noslash'),

    # Users, Blog, SEO pages
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users', AdminUserListView.as_view(), name='admin-users-noslash'),
    path('blog/', AdminBlogListView.as_view(), name='admin-blog'),
    path('blog', AdminBlogListView.as_view(), name='admin-blog-noslash'),
    path('seo/', AdminSeoListView.as_view(), name='admin-seo'),
    path('seo', AdminSeoListView.as_view(), name='admin-seo-noslash'),

    # ── SEO auto-generation & scoring ────────────────────────────────────────
    # Per-product SEO regeneration
    path('products/<int:pk>/regenerate-seo/', AdminProductSeoRegenerateView.as_view(), name='admin-product-regenerate-seo'),
    path('products/<int:pk>/regenerate-seo', AdminProductSeoRegenerateView.as_view(), name='admin-product-regenerate-seo-noslash'),
    # Batch: regenerate all products missing SEO fields
    path('products/bulk-regenerate-seo/', AdminProductBulkSeoRegenerateView.as_view(), name='admin-products-bulk-seo'),
    path('products/bulk-regenerate-seo', AdminProductBulkSeoRegenerateView.as_view(), name='admin-products-bulk-seo-noslash'),
    # Ping Google + Bing with sitemap
    path('sitemap/ping/', AdminSitemapPingView.as_view(), name='admin-sitemap-ping'),
    path('sitemap/ping', AdminSitemapPingView.as_view(), name='admin-sitemap-ping-noslash'),
    # SEO score per product
    path('seo/score/', AdminSeoScoreView.as_view(), name='admin-seo-score'),
    path('seo/score', AdminSeoScoreView.as_view(), name='admin-seo-score-noslash'),
]
