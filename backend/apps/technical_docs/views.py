from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import F
from .models import TechnicalDocument
from .serializers import TechnicalDocumentSerializer

class TechnicalDocumentListView(generics.ListAPIView):
    """
    Public list view of published technical documents.
    Supports filtering by doc_type and product slug.
    """
    serializer_class = TechnicalDocumentSerializer

    def get_queryset(self):
        queryset = TechnicalDocument.objects.filter(is_published=True).prefetch_related('related_products')
        doc_type = self.request.query_params.get('doc_type')
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
        product_slug = self.request.query_params.get('product')
        if product_slug:
            queryset = queryset.filter(related_products__slug=product_slug)
        return queryset

class TechnicalDocumentDetailView(generics.RetrieveAPIView):
    """
    Public detail view of a technical document by slug.
    Also increments the view count.
    """
    queryset = TechnicalDocument.objects.filter(is_published=True).prefetch_related('related_products')
    serializer_class = TechnicalDocumentSerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        TechnicalDocument.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        # Refresh instance from database
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
