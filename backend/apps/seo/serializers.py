from rest_framework import serializers
from .models import SeoPage


class SeoPageSerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = SeoPage
        fields = [
            'id', 'page', 'metaTitle', 'metaDescription',
            'ogTitle', 'ogDescription', 'ogImageUrl',
            'keywords', 'canonicalUrl', 'structuredData',
            'robots', 'updatedAt',
        ]

    # camelCase aliases
    metaTitle = serializers.CharField(source='meta_title', required=False, allow_null=True, allow_blank=True)
    metaDescription = serializers.CharField(source='meta_description', required=False, allow_null=True, allow_blank=True)
    ogTitle = serializers.CharField(source='og_title', required=False, allow_null=True, allow_blank=True)
    ogDescription = serializers.CharField(source='og_description', required=False, allow_null=True, allow_blank=True)
    ogImageUrl = serializers.CharField(source='og_image_url', required=False, allow_null=True, allow_blank=True)
    canonicalUrl = serializers.CharField(source='canonical_url', required=False, allow_null=True, allow_blank=True)
    structuredData = serializers.JSONField(source='structured_data', required=False, allow_null=True)

    def get_keywords(self, obj):
        return obj.keywords_list()
