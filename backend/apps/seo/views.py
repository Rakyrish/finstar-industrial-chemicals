from django.conf import settings
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SeoPage
from .serializers import SeoPageSerializer


class SeoPageViewSet(viewsets.ModelViewSet):
    queryset = SeoPage.objects.all()
    serializer_class = SeoPageSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class SiteSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'company': {
                'name': getattr(settings, 'COMPANY_NAME', 'Finstar Industrial Chemicals'),
                'brandName': getattr(settings, 'COMPANY_BRAND_NAME', 'FINSTAR'),
                'tagline': getattr(settings, 'COMPANY_TAGLINE', 'Industrial chemical supply for East Africa'),
                'description': getattr(settings, 'COMPANY_DESCRIPTION', 'Supplier of industrial chemicals, solvents, acids, alkalis, and specialty raw materials.'),
                'email': getattr(settings, 'COMPANY_EMAIL', ''),
                'phone': getattr(settings, 'COMPANY_PHONE', ''),
                'whatsappNumber': getattr(settings, 'COMPANY_WHATSAPP_NUMBER', ''),
                'address': getattr(settings, 'COMPANY_ADDRESS', ''),
                'addressLink': getattr(settings, 'COMPANY_ADDRESS_LINK', ''),
                'businessHours': [
                    {'label': 'Monday - Friday', 'value': getattr(settings, 'COMPANY_WEEKDAY_HOURS', '8:00 AM - 5:00 PM')},
                    {'label': 'Saturday', 'value': getattr(settings, 'COMPANY_SATURDAY_HOURS', '8:30 AM - 1:00 PM')},
                    {'label': 'Sunday & Holidays', 'value': getattr(settings, 'COMPANY_HOLIDAY_HOURS', 'Closed / Scheduled dispatch only')},
                ],
            },
            'socialLinks': [
                link for link in [
                    {'platform': 'facebook', 'href': getattr(settings, 'COMPANY_FACEBOOK_URL', ''), 'label': 'Facebook'},
                    {'platform': 'linkedin', 'href': getattr(settings, 'COMPANY_LINKEDIN_URL', ''), 'label': 'LinkedIn'},
                    {'platform': 'whatsapp', 'href': f"https://wa.me/{getattr(settings, 'COMPANY_WHATSAPP_NUMBER', '')}", 'label': 'WhatsApp'} if getattr(settings, 'COMPANY_WHATSAPP_NUMBER', '') else None,
                ] if link and link['href']
            ],
        })
