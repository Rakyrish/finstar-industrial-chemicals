from rest_framework import viewsets, permissions
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['source', 'status']
    search_fields = ['full_name', 'email', 'company']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
