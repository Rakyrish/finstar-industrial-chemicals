import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import Lead


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


@admin.action(description='Mark selected leads as contacted')
def mark_contacted(modeladmin, request, queryset):
    queryset.update(status='contacted')


@admin.action(description='Mark selected leads as converted')
def mark_converted(modeladmin, request, queryset):
    queryset.update(status='converted')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company', 'source', 'status', 'assigned_to', 'created_at')
    list_filter = ('source', 'status', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'company', 'source_page', 'referrer', 'notes', 'assigned_to')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    actions = (mark_contacted, mark_converted, export_as_csv)
