import json
from rest_framework import serializers
from .models import Category, Tag, Product


class CategorySerializer(serializers.ModelSerializer):
    productCount = serializers.IntegerField(source='products.count', read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_featured', 'productCount']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    primaryImage = serializers.SerializerMethodField()
    isNew = serializers.BooleanField(source='is_new')
    isFeatured = serializers.BooleanField(source='is_featured')
    updatedAt = serializers.DateTimeField(source='updated_at', format='%Y-%m-%d')
    inventory = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'tags', 'primaryImage',
            'short_description', 'status', 'isNew', 'isFeatured',
            'packaging_type', 'pricing', 'updatedAt', 'inventory',
        ]

    def get_category(self, obj):
        return obj.category.name if obj.category else 'Uncategorized'

    def get_primaryImage(self, obj):
        return obj.get_primary_image_url()

    def get_inventory(self, obj):
        stock = getattr(obj, 'stock_item', None)
        return float(stock.quantity_on_hand) if stock else 0


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    primaryImage = serializers.SerializerMethodField()
    isNew = serializers.BooleanField(source='is_new')
    isFeatured = serializers.BooleanField(source='is_featured')
    cloudinaryUrl = serializers.URLField(source='cloudinary_url', allow_null=True)
    cloudinaryPublicId = serializers.CharField(source='cloudinary_public_id', allow_null=True)
    seoTitle = serializers.CharField(source='seo_title', allow_null=True)
    seoDescription = serializers.CharField(source='seo_description', allow_null=True)
    seoKeywords = serializers.CharField(source='seo_keywords', allow_null=True)
    ogDescription = serializers.CharField(source='og_description', allow_null=True)
    twitterDescription = serializers.CharField(source='twitter_description', allow_null=True)
    imageAlt = serializers.CharField(source='image_alt', allow_null=True)
    imageTitle = serializers.CharField(source='image_title', allow_null=True)
    imageCaption = serializers.CharField(source='image_caption', allow_null=True)
    whatsappTemplate = serializers.CharField(source='whatsapp_template', allow_null=True)
    quotationTemplate = serializers.CharField(source='quotation_template', allow_null=True)
    ctaContent = serializers.CharField(source='cta_content', allow_null=True)
    schemaMarkup = serializers.CharField(source='schema_markup', allow_null=True)
    publishAt = serializers.DateTimeField(source='publish_at', allow_null=True)
    updatedAt = serializers.DateTimeField(source='updated_at', format='%Y-%m-%dT%H:%M:%SZ')
    createdAt = serializers.DateTimeField(source='created_at', format='%Y-%m-%dT%H:%M:%SZ')
    applications = serializers.SerializerMethodField()
    benefits = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    industriesServed = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    specifications = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'tags', 'primaryImage',
            'short_description', 'description', 'long_description',
            'applications', 'benefits', 'features', 'industriesServed', 'faqs',
            'specifications', 'status', 'isNew', 'isFeatured',
            'min_order_quantity', 'unit_of_measure', 'packaging_type', 'pricing',
            'cas_number', 'chemical_formula', 'purity', 'appearance', 'density',
            'hazard_classification',
            'cloudinaryUrl', 'cloudinaryPublicId',
            'imageAlt', 'imageTitle', 'imageCaption',
            'seoTitle', 'seoDescription', 'seoKeywords',
            'ogDescription', 'twitterDescription',
            'schemaMarkup', 'whatsappTemplate', 'quotationTemplate', 'ctaContent',
            'publishAt', 'createdAt', 'updatedAt',
        ]

    def get_primaryImage(self, obj): return obj.get_primary_image_url()
    def get_applications(self, obj): return obj.get_applications()
    def get_benefits(self, obj): return obj.get_benefits()
    def get_features(self, obj): return obj.get_features()
    def get_industriesServed(self, obj): return obj.get_industries_served()
    def get_faqs(self, obj): return obj.get_faqs()
    def get_specifications(self, obj): return obj.get_specifications()
