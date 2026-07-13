from django.urls import path

from .views import PublicProtectionSettingsView

urlpatterns = [
    path('protection-settings/', PublicProtectionSettingsView.as_view(), name='protection-settings'),
]
