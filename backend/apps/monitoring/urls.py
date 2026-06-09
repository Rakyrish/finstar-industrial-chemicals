from django.urls import path
from . import views

urlpatterns = [
    # Website Operations Overview
    path('overview/', views.MonitoringOverviewView.as_view(), name='monitoring-overview'),
    path('overview', views.MonitoringOverviewView.as_view(), name='monitoring-overview-noslash'),

    # SEO Health Audit
    path('seo/', views.SeoAuditView.as_view(), name='monitoring-seo'),
    path('seo', views.SeoAuditView.as_view(), name='monitoring-seo-noslash'),

    # Core Web Vitals (server aggregations)
    path('performance/', views.PerformanceView.as_view(), name='monitoring-performance'),
    path('performance', views.PerformanceView.as_view(), name='monitoring-performance-noslash'),

    # Public Web Vitals ingestion endpoint (called from Next.js useReportWebVitals)
    path('vitals/', views.PublicVitalsView.as_view(), name='monitoring-vitals-ingest'),
    path('vitals', views.PublicVitalsView.as_view(), name='monitoring-vitals-ingest-noslash'),

    # Error Log Center
    path('errors/', views.ErrorLogView.as_view(), name='monitoring-errors'),
    path('errors', views.ErrorLogView.as_view(), name='monitoring-errors-noslash'),
    path('errors/<int:pk>/', views.ErrorLogView.as_view(), name='monitoring-errors-detail'),
    path('errors/<int:pk>', views.ErrorLogView.as_view(), name='monitoring-errors-detail-noslash'),

    # API Health Dashboard
    path('api-health/', views.ApiHealthView.as_view(), name='monitoring-api-health'),
    path('api-health', views.ApiHealthView.as_view(), name='monitoring-api-health-noslash'),

    # AI Usage & Chatbot Stats
    path('ai-usage/', views.AiUsageView.as_view(), name='monitoring-ai-usage'),
    path('ai-usage', views.AiUsageView.as_view(), name='monitoring-ai-usage-noslash'),

    # Security Logs
    path('security/', views.SecurityLogView.as_view(), name='monitoring-security'),
    path('security', views.SecurityLogView.as_view(), name='monitoring-security-noslash'),

    # Business Intelligence Reporting
    path('bi/', views.BiReportingView.as_view(), name='monitoring-bi'),
    path('bi', views.BiReportingView.as_view(), name='monitoring-bi-noslash'),
    path('bi/export/', views.BiExportView.as_view(), name='monitoring-bi-export'),
    path('bi/export', views.BiExportView.as_view(), name='monitoring-bi-export-noslash'),

    # Website Auditor (crawl + DB checks)
    path('auditor/', views.WebsiteAuditorView.as_view(), name='monitoring-auditor'),
    path('auditor', views.WebsiteAuditorView.as_view(), name='monitoring-auditor-noslash'),
]
