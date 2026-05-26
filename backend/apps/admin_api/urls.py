from django.urls import path
from .views import (
    AdminOverviewView,
    AdminAnalyticsView,
    AdminChatbotMonitoringView,
    AdminUserListView,
    AdminBlogListView,
    AdminSeoListView,
    AdminGenerateProductContentView,
    # New views
    AdminProductListView,
    AdminProductDetailView,
    AdminImageUploadView,
    AdminImageUrlUploadView,
    AdminCategoryListView,
    AdminChatbotAnalyticsView,
)

urlpatterns = [
    # Dashboard & analytics
    path('overview/', AdminOverviewView.as_view(), name='admin-overview'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),

    # Products
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

    # Users, Blog, SEO
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('blog/', AdminBlogListView.as_view(), name='admin-blog'),
    path('seo/', AdminSeoListView.as_view(), name='admin-seo'),
]
