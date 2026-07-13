from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WatermarkSettings


class PublicProtectionSettingsView(APIView):
    """
    Unauthenticated endpoint for the public site's client-side enforcement
    (right-click/drag/long-press guards). Intentionally exposes ONLY the 4
    interaction toggles — never `watermark_enabled` or any design field.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings_row = WatermarkSettings.get_solo()
        return Response({
            'rightClickProtectionEnabled': settings_row.right_click_protection_enabled,
            'dragProtectionEnabled': settings_row.drag_protection_enabled,
            'longPressProtectionEnabled': settings_row.long_press_protection_enabled,
            'seoMetadataProtectionEnabled': settings_row.seo_metadata_protection_enabled,
        })
