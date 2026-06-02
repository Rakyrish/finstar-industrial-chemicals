import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import BlogCategory, BlogPost, BlogTag


def export_as_csv(modeladmin, request, queryset):
    meta = modeladmin.model._meta
    field_names = [field.name for field in meta.fields]
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename={meta.model_name}.csv'
    writer = csv.writer(response)
    writer.writerow(field_names)
    for obj in queryset:
        writer.writerow([getattr(obj, field) for field in field_names])
    return response


export_as_csv.short_description = 'Export selected records as CSV'


@admin.action(description='Publish selected posts')
def publish_posts(modeladmin, request, queryset):
    queryset.update(status='published')


@admin.action(description='Archive selected posts')
def archive_posts(modeladmin, request, queryset):
    queryset.update(status='archived')


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    actions = (export_as_csv,)


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    actions = (export_as_csv,)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author_name', 'status', 'views', 'published_at', 'updated_at')
    list_filter = ('status', 'category', 'created_at', 'published_at')
    search_fields = ('title', 'slug', 'excerpt', 'content', 'seo_title', 'seo_description')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    date_hierarchy = 'created_at'
    readonly_fields = ('views', 'created_at', 'updated_at')
    actions = (publish_posts, archive_posts, export_as_csv)
