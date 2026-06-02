import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import ContactMessage, QuoteRequest


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


@admin.action(description='Mark selected quote requests as sent')
def mark_quotes_sent(modeladmin, request, queryset):
    queryset.update(status='sent')


@admin.action(description='Mark selected messages as replied')
def mark_messages_replied(modeladmin, request, queryset):
    queryset.update(status='replied')


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'custom_product_name', 'company', 'full_name', 'status', 'quantity', 'unit_of_measure', 'created_at')
    list_filter = ('status', 'need_msds', 'need_coa', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'company', 'custom_product_name', 'product__name', 'additional_notes')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    actions = (mark_quotes_sent, export_as_csv)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company', 'email', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'company', 'message')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)
    actions = (mark_messages_replied, export_as_csv)
