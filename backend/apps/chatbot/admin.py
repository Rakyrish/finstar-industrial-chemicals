import csv

from django.contrib import admin
from django.http import HttpResponse

from .models import ChatMessage, ChatSession


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


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'content', 'timestamp')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'created_at', 'updated_at')
    search_fields = ('session_id',)
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    inlines = (ChatMessageInline,)
    actions = (export_as_csv,)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'role', 'short_content', 'timestamp')
    list_filter = ('role', 'timestamp')
    search_fields = ('session__session_id', 'content')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)
    actions = (export_as_csv,)

    def short_content(self, obj):
        return obj.content[:90]
