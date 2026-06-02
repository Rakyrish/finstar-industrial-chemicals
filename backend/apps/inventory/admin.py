import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import StockItem, WarehouseLocation


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


@admin.register(WarehouseLocation)
class WarehouseLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
    search_fields = ('name', 'code', 'address')
    actions = (export_as_csv,)


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse_location', 'quantity_on_hand', 'safety_stock_level', 'sync_status', 'last_synced', 'last_updated')
    list_filter = ('sync_status', 'warehouse_location', 'last_updated')
    search_fields = ('product__name', 'warehouse_location__name', 'warehouse_location__code', 'last_error_log')
    readonly_fields = ('last_updated',)
    actions = (export_as_csv,)
