import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import PageView, PhoneClick, SearchQuery, WhatsAppClick


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


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ('page', 'device', 'ip_address', 'timestamp')
    list_filter = ('device', 'timestamp')
    search_fields = ('page', 'referrer', 'user_agent', 'ip_address')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)
    actions = (export_as_csv,)


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ('query', 'results_count', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('query',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)
    actions = (export_as_csv,)


@admin.register(WhatsAppClick)
class WhatsAppClickAdmin(admin.ModelAdmin):
    list_display = ('source_page', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('source_page',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)
    actions = (export_as_csv,)


@admin.register(PhoneClick)
class PhoneClickAdmin(admin.ModelAdmin):
    list_display = ('source_page', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('source_page',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)
    actions = (export_as_csv,)
