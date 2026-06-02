from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('django/admin/', admin.site.urls),
    
    # OpenAPI Documentation Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Routers
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/products/', include('products.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/inquiries/', include('inquiries.urls')),
    path('api/v1/chatbot/', include('chatbot.urls')),
    path('api/v1/suppliers/', include('suppliers.urls')),
    path('api/v1/blog/', include('blog.urls')),
    path('api/v1/seo/', include('seo.urls')),
    path('api/v1/crm/', include('crm.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/admin/', include('admin_api.urls')),
]

# Serve static/media assets in debug dev environment
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
