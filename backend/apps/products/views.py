from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Tag, Product
from .serializers import CategorySerializer, TagSerializer, ProductListSerializer, ProductDetailSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(status='active')
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(status='active')
        
        # Filtering by category slug
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        # Filtering by search query term (Search by name, CAS Number, formula, tag, description)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(cas_number__icontains=search_query) |
                Q(chemical_formula__icontains=search_query) |
                Q(short_description__icontains=search_query) |
                Q(tags__name__icontains=search_query)
            ).distinct()

        # Filtering by tags
        tag_slug = self.request.query_params.get('tag', None)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        limit = int(request.query_params.get('limit', 6))
        featured_products = Product.objects.filter(status='active', is_featured=True)[:limit]
        serializer = ProductListSerializer(featured_products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        limit = int(request.query_params.get('limit', 3))
        
        # Get products in same category excluding current product
        related_products = Product.objects.filter(
            status='active', 
            category=product.category
        ).exclude(id=product.id)[:limit]
        
        # If not enough, fill with other active products
        if related_products.count() < limit:
            remaining = limit - related_products.count()
            additional = Product.objects.filter(status='active').exclude(
                Q(id=product.id) | Q(category=product.category)
            )[:remaining]
            related_products = list(related_products) + list(additional)
            
        serializer = ProductListSerializer(related_products, many=True, context={'request': request})
        return Response(serializer.data)
