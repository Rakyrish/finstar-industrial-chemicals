from django.conf import settings
from rest_framework import viewsets, mixins
from .models import QuoteRequest, ContactMessage
from .serializers import QuoteRequestSerializer, ContactMessageSerializer
from crm.models import Lead
from services.resend_service import resend_service


class QuoteRequestViewSet(mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer

    def perform_create(self, serializer):
        quote = serializer.save()
        product_name = quote.product.name if quote.product else (quote.custom_product_name or 'Custom product')
        
        # Create CRM Lead
        Lead.objects.create(
            full_name=quote.full_name,
            email=quote.email,
            phone=quote.phone,
            company=quote.company,
            source='quote_request',
            quote_request_id=quote.id,
            notes=f"Product: {product_name}\nQty: {quote.quantity} {quote.unit_of_measure}\nMsg: {quote.additional_notes or ''}"
        )

        # Send Email Notification
        subject = f"New Quote Request: {product_name} from {quote.full_name}"
        html = f"""
        <h2>New Quote Request Received</h2>
        <p><strong>Name:</strong> {quote.full_name}</p>
        <p><strong>Company:</strong> {quote.company}</p>
        <p><strong>Email:</strong> {quote.email}</p>
        <p><strong>Phone:</strong> {quote.phone}</p>
        <p><strong>Product:</strong> {product_name}</p>
        <p><strong>Quantity:</strong> {quote.quantity} {quote.unit_of_measure}</p>
        <p><strong>Message:</strong><br/>{quote.additional_notes or ''}</p>
        """
        resend_service.send_email(to=getattr(settings, 'COMPANY_EMAIL', ''), subject=subject, html_content=html)


class ContactMessageViewSet(mixins.CreateModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.ListModelMixin,
                            viewsets.GenericViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        msg = serializer.save()

        # Create CRM Lead
        Lead.objects.create(
            full_name=msg.full_name,
            email=msg.email,
            phone=msg.phone,
            company=msg.company,
            source='contact_form',
            contact_message_id=msg.id,
            notes=f"Msg: {msg.message}"
        )

        # Send Email Notification
        subject = f"New Contact Message from {msg.full_name}"
        html = f"""
        <h2>New Contact Message Received</h2>
        <p><strong>Name:</strong> {msg.full_name}</p>
        <p><strong>Email:</strong> {msg.email}</p>
        <p><strong>Phone:</strong> {msg.phone}</p>
        <p><strong>Company:</strong> {msg.company or ''}</p>
        <p><strong>Message:</strong><br/>{msg.message}</p>
        """
        resend_service.send_email(to=getattr(settings, 'COMPANY_EMAIL', ''), subject=subject, html_content=html)
