from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import BlogCategory, BlogTag, BlogPost
from .serializers import (
    BlogCategorySerializer, BlogTagSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostWriteSerializer,
)


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    lookup_field = 'slug'


class BlogTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    lookup_field = 'slug'


class BlogPostViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'

    def get_queryset(self):
        # Admins see all posts; public sees only published
        if self.request.user and self.request.user.is_staff:
            qs = BlogPost.objects.all()
        else:
            qs = BlogPost.objects.filter(status='published')

        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering', '-published_at')

        if category:
            qs = qs.filter(category__slug=category)
        if tag:
            qs = qs.filter(tags__slug=tag)
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(excerpt__icontains=search) |
                Q(content__icontains=search)
            ).distinct()
        qs = qs.order_by(ordering)
        return qs

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BlogPostWriteSerializer
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'recent', 'related']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        BlogPost.objects.filter(pk=instance.pk).update(views=instance.views + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recent(self, request):
        limit = int(request.query_params.get('limit', 3))
        posts = BlogPost.objects.filter(status='published').order_by('-published_at')[:limit]
        serializer = BlogPostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def related(self, request, slug=None):
        post = self.get_object()
        limit = int(request.query_params.get('limit', 3))
        related = BlogPost.objects.filter(
            status='published',
            category=post.category
        ).exclude(pk=post.pk).order_by('-published_at')[:limit]
        serializer = BlogPostListSerializer(related, many=True, context={'request': request})
        return Response(serializer.data)
