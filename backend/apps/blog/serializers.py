from rest_framework import serializers
from .models import BlogCategory, BlogTag, BlogPost


class BlogCategorySerializer(serializers.ModelSerializer):
    postCount = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'postCount']


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogPostListSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    authorName = serializers.SerializerMethodField()
    coverImage = serializers.CharField(source='cover_image_url', default=None)
    publishedAt = serializers.DateTimeField(source='published_at')
    readingTime = serializers.IntegerField(source='reading_time')
    updatedAt = serializers.DateTimeField(source='updated_at', format='%Y-%m-%d', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'authorName',
            'category', 'tags', 'coverImage', 'publishedAt',
            'readingTime', 'views', 'status', 'updatedAt',
        ]

    def get_authorName(self, obj):
        if obj.author_name:
            return obj.author_name
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return 'Finstar Team'


class BlogPostDetailSerializer(BlogPostListSerializer):
    seoTitle = serializers.CharField(source='seo_title', default=None)
    seoDescription = serializers.CharField(source='seo_description', default=None)
    ogImageUrl = serializers.CharField(source='og_image_url', default=None)

    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + [
            'content', 'seoTitle', 'seoDescription', 'ogImageUrl',
        ]


class BlogPostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'excerpt', 'content', 'author_name',
            'category', 'tags', 'cover_image_url', 'cover_image_public_id',
            'seo_title', 'seo_description', 'og_image_url',
            'reading_time', 'status', 'published_at',
        ]
