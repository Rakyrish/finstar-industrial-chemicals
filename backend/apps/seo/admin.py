import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import SeoPage


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


@admin.register(SeoPage)
class SeoPageAdmin(admin.ModelAdmin):
    list_display = ('page', 'meta_title', 'robots', 'updated_at')
    list_filter = ('robots', 'updated_at')
    search_fields = ('page', 'meta_title', 'meta_description', 'keywords', 'canonical_url')
    readonly_fields = ('updated_at',)
    actions = (export_as_csv,)
