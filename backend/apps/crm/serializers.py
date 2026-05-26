from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    sourcePage = serializers.CharField(source='source_page', required=False, allow_null=True)
    quoteRequestId = serializers.IntegerField(source='quote_request_id', required=False, allow_null=True)
    contactMessageId = serializers.IntegerField(source='contact_message_id', required=False, allow_null=True)
    assignedTo = serializers.CharField(source='assigned_to', required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'email', 'phone', 'company',
            'source', 'sourcePage', 'referrer',
            'quoteRequestId', 'contactMessageId',
            'status', 'notes', 'assignedTo',
            'createdAt', 'updatedAt',
        ]
