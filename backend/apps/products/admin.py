import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import Category, Product, Tag


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


@admin.action(description='Mark selected products as active')
def mark_active(modeladmin, request, queryset):
    queryset.update(status='active')


@admin.action(description='Archive selected products')
def mark_discontinued(modeladmin, request, queryset):
    queryset.update(status='discontinued')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_featured')
    list_filter = ('is_featured',)
    search_fields = ('name', 'slug', 'description', 'seo_title', 'seo_keywords')
    prepopulated_fields = {'slug': ('name',)}
    actions = (export_as_csv,)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    actions = (export_as_csv,)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'is_featured', 'is_new', 'created_at', 'updated_at')
    list_filter = ('status', 'is_featured', 'is_new', 'category', 'created_at')
    search_fields = ('name', 'slug', 'short_description', 'description', 'seo_title', 'seo_keywords')
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ('tags',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    actions = (mark_active, mark_discontinued, export_as_csv)
    fieldsets = (
        ('Core product', {'fields': ('name', 'slug', 'category', 'tags', 'status')}),
        ('Content', {'fields': ('short_description', 'description', 'long_description')}),
        ('Structured content', {'fields': ('applications', 'benefits', 'features', 'industries_served', 'faqs')}),
        ('Technical details', {'fields': ('cas_number', 'chemical_formula', 'purity', 'appearance', 'density', 'specifications')}),
        ('Commercial and logistics', {'fields': ('packaging_type', 'pricing', 'min_order_quantity', 'unit_of_measure')}),
        ('Media', {'fields': ('primary_image', 'cloudinary_url', 'cloudinary_public_id', 'image_alt', 'image_title', 'image_caption')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'seo_keywords', 'og_title', 'og_description', 'twitter_description', 'schema_markup')}),
        ('Sales templates', {'fields': ('whatsapp_template', 'quotation_template', 'cta_content')}),
        ('Safety', {'fields': ('hazard_classification',)}),
        ('Publishing', {'fields': ('is_featured', 'is_new', 'publish_at', 'published_at', 'created_at', 'updated_at')}),
    )
