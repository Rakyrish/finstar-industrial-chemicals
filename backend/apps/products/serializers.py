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
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    primaryImage = serializers.SerializerMethodField()
    isNew = serializers.BooleanField(source='is_new')
    isFeatured = serializers.BooleanField(source='is_featured')
    minOrderQuantity = serializers.DecimalField(source='min_order_quantity', max_digits=10, decimal_places=2)
    unitOfMeasure = serializers.CharField(source='unit_of_measure')
    shortDescription = serializers.CharField(source='short_description')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'tags', 'primaryImage', 
            'shortDescription', 'status', 'isNew', 'isFeatured', 
            'minOrderQuantity', 'unitOfMeasure'
        ]

    def get_primaryImage(self, obj):
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    primaryImage = serializers.SerializerMethodField()
    isNew = serializers.BooleanField(source='is_new')
    isFeatured = serializers.BooleanField(source='is_featured')
    minOrderQuantity = serializers.DecimalField(source='min_order_quantity', max_digits=10, decimal_places=2)
    unitOfMeasure = serializers.CharField(source='unit_of_measure')
    shortDescription = serializers.CharField(source='short_description')
    casNumber = serializers.CharField(source='cas_number', required=False, allow_null=True)
    chemicalFormula = serializers.CharField(source='chemical_formula', required=False, allow_null=True)
    packagingType = serializers.CharField(source='packaging_type', required=False, allow_null=True)
    hazardClassification = serializers.CharField(source='hazard_classification', required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'tags', 'primaryImage', 
            'shortDescription', 'description', 'status', 'isNew', 'isFeatured', 
            'minOrderQuantity', 'unitOfMeasure', 'casNumber', 'chemicalFormula',
            'purity', 'appearance', 'density', 'packagingType', 'hazardClassification',
            'created_at', 'updated_at'
        ]

    def get_primaryImage(self, obj):
        if obj.primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.primary_image.url)
            return obj.primary_image.url
        return None
