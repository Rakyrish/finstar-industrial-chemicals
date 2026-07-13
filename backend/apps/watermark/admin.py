from django.contrib import admin

from .models import WatermarkBatch, WatermarkJob, WatermarkSettings


@admin.register(WatermarkSettings)
class WatermarkSettingsAdmin(admin.ModelAdmin):
    list_display = ('watermark_enabled', 'watermark_position', 'watermark_opacity', 'updated_at')

    def has_add_permission(self, request):
        return not WatermarkSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(WatermarkBatch)
class WatermarkBatchAdmin(admin.ModelAdmin):
    list_display = ('batch_id', 'action', 'scope_type', 'status', 'queued_count', 'created_at')
    list_filter = ('status', 'action', 'scope_type')
    readonly_fields = ('batch_id', 'created_at', 'updated_at')


@admin.register(WatermarkJob)
class WatermarkJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'batch', 'product', 'action', 'status', 'attempts', 'created_at')
    list_filter = ('status', 'action')
    search_fields = ('product__name',)
    readonly_fields = ('created_at',)
