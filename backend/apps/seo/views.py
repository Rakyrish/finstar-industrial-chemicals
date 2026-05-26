from rest_framework import viewsets, permissions
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
