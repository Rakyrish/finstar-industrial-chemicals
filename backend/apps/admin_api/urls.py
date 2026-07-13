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
    # Blog content marketing
    AdminBlogDetailView,
    AdminBlogCreateView,
    AdminGenerateBlogContentView,
    AdminGenerateDataSheetView,
    AdminTechnicalDocListView,
    AdminTechnicalDocDetailView,
    AdminBlogAnalyticsView,
)
from .watermark_views import (
    AdminWatermarkSettingsView,
    AdminWatermarkPreviewView,
    AdminWatermarkScopesView,
    AdminWatermarkBulkApplyView,
    AdminWatermarkRestoreAllView,
    AdminWatermarkBatchListView,
    AdminWatermarkBatchStatusView,
    AdminWatermarkBatchPauseView,
    AdminWatermarkBatchResumeView,
    AdminWatermarkBatchCancelView,
    AdminWatermarkProductApplyView,
    AdminWatermarkProductRestoreView,
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

    # AI generation — Products
    path('ai/generate-product/', AdminGenerateProductContentView.as_view(), name='admin-ai-generate-product'),
    path('ai/generate-product', AdminGenerateProductContentView.as_view(), name='admin-ai-generate-product-noslash'),
    # AI generation — Blog
    path('ai/generate-blog/', AdminGenerateBlogContentView.as_view(), name='admin-ai-generate-blog'),
    path('ai/generate-blog', AdminGenerateBlogContentView.as_view(), name='admin-ai-generate-blog-noslash'),
    # AI generation — Data Sheet
    path('ai/generate-datasheet/', AdminGenerateDataSheetView.as_view(), name='admin-ai-generate-datasheet'),
    path('ai/generate-datasheet', AdminGenerateDataSheetView.as_view(), name='admin-ai-generate-datasheet-noslash'),

    # Chatbot
    path('chatbot/', AdminChatbotMonitoringView.as_view(), name='admin-chatbot'),
    path('chatbot', AdminChatbotMonitoringView.as_view(), name='admin-chatbot-noslash'),
    path('chatbot/analytics/', AdminChatbotAnalyticsView.as_view(), name='admin-chatbot-analytics'),
    path('chatbot/analytics', AdminChatbotAnalyticsView.as_view(), name='admin-chatbot-analytics-noslash'),

    # Users, Blog list, SEO pages
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users', AdminUserListView.as_view(), name='admin-users-noslash'),
    path('blog/', AdminBlogListView.as_view(), name='admin-blog'),
    path('blog', AdminBlogListView.as_view(), name='admin-blog-noslash'),
    # Blog CRUD — create
    path('blog/create/', AdminBlogCreateView.as_view(), name='admin-blog-create'),
    path('blog/create', AdminBlogCreateView.as_view(), name='admin-blog-create-noslash'),
    # Blog CRUD — detail / edit / delete
    path('blog/<int:pk>/', AdminBlogDetailView.as_view(), name='admin-blog-detail'),
    path('blog/<int:pk>', AdminBlogDetailView.as_view(), name='admin-blog-detail-noslash'),
    # Blog analytics
    path('blog-analytics/', AdminBlogAnalyticsView.as_view(), name='admin-blog-analytics'),
    path('blog-analytics', AdminBlogAnalyticsView.as_view(), name='admin-blog-analytics-noslash'),

    # SEO
    path('seo/', AdminSeoListView.as_view(), name='admin-seo'),
    path('seo', AdminSeoListView.as_view(), name='admin-seo-noslash'),

    # ── SEO auto-generation & scoring ────────────────────────────────────────
    path('products/<int:pk>/regenerate-seo/', AdminProductSeoRegenerateView.as_view(), name='admin-product-regenerate-seo'),
    path('products/<int:pk>/regenerate-seo', AdminProductSeoRegenerateView.as_view(), name='admin-product-regenerate-seo-noslash'),
    path('products/bulk-regenerate-seo/', AdminProductBulkSeoRegenerateView.as_view(), name='admin-products-bulk-seo'),
    path('products/bulk-regenerate-seo', AdminProductBulkSeoRegenerateView.as_view(), name='admin-products-bulk-seo-noslash'),
    path('sitemap/ping/', AdminSitemapPingView.as_view(), name='admin-sitemap-ping'),
    path('sitemap/ping', AdminSitemapPingView.as_view(), name='admin-sitemap-ping-noslash'),
    path('seo/score/', AdminSeoScoreView.as_view(), name='admin-seo-score'),
    path('seo/score', AdminSeoScoreView.as_view(), name='admin-seo-score-noslash'),

    # ── Technical Documents ───────────────────────────────────────────────────
    path('technical-docs/', AdminTechnicalDocListView.as_view(), name='admin-technical-docs'),
    path('technical-docs', AdminTechnicalDocListView.as_view(), name='admin-technical-docs-noslash'),
    path('technical-docs/<int:pk>/', AdminTechnicalDocDetailView.as_view(), name='admin-technical-doc-detail'),
    path('technical-docs/<int:pk>', AdminTechnicalDocDetailView.as_view(), name='admin-technical-doc-detail-noslash'),

    # ── Image protection / watermarking ───────────────────────────────────────
    path('watermark/settings/', AdminWatermarkSettingsView.as_view(), name='admin-watermark-settings'),
    path('watermark/preview/', AdminWatermarkPreviewView.as_view(), name='admin-watermark-preview'),
    path('watermark/scopes/', AdminWatermarkScopesView.as_view(), name='admin-watermark-scopes'),
    path('watermark/bulk-apply/', AdminWatermarkBulkApplyView.as_view(), name='admin-watermark-bulk-apply'),
    path('watermark/restore-all/', AdminWatermarkRestoreAllView.as_view(), name='admin-watermark-restore-all'),
    path('watermark/batches/', AdminWatermarkBatchListView.as_view(), name='admin-watermark-batches'),
    path('watermark/batches/<uuid:batch_id>/', AdminWatermarkBatchStatusView.as_view(), name='admin-watermark-batch-status'),
    path('watermark/batches/<uuid:batch_id>/pause/', AdminWatermarkBatchPauseView.as_view(), name='admin-watermark-batch-pause'),
    path('watermark/batches/<uuid:batch_id>/resume/', AdminWatermarkBatchResumeView.as_view(), name='admin-watermark-batch-resume'),
    path('watermark/batches/<uuid:batch_id>/cancel/', AdminWatermarkBatchCancelView.as_view(), name='admin-watermark-batch-cancel'),
    path('watermark/products/<int:pk>/apply/', AdminWatermarkProductApplyView.as_view(), name='admin-watermark-product-apply'),
    path('watermark/products/<int:pk>/restore/', AdminWatermarkProductRestoreView.as_view(), name='admin-watermark-product-restore'),
]
