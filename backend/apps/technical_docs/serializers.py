from rest_framework import serializers
from .models import TechnicalDocument
from products.serializers import ProductListSerializer

class TechnicalDocumentSerializer(serializers.ModelSerializer):
    doc_type_label = serializers.CharField(source='get_doc_type_display', read_only=True)
    related_products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = TechnicalDocument
        fields = [
            'id',
            'title',
            'slug',
            'doc_type',
            'doc_type_label',
            'standard_code',
            'meta_title',
            'meta_description',
            'excerpt',
            'body_html',
            'pdf_file',
            'related_products',
            'is_published',
            'created_at',
            'updated_at',
            'view_count',
        ]
