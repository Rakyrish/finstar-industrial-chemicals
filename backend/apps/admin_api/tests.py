from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from analytics.models import PageView, PhoneClick, WhatsAppClick
from blog.models import BlogPost
from chatbot.models import ChatMessage, ChatSession
from inquiries.models import ContactMessage, QuoteRequest
from inventory.models import StockItem, WarehouseLocation
from products.models import Category, Product
from seo.models import SeoPage


class AdminOverviewTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='test-password',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_overview_returns_live_dashboard_data(self):
        category = Category.objects.create(name='Solvents')
        product = Product.objects.create(
            name='Acetone',
            category=category,
            status='active',
            short_description='Industrial solvent',
            unit_of_measure='L',
            seo_title='Acetone supplier',
            seo_description='Bulk acetone supply',
            image_alt='Acetone drum',
        )
        warehouse = WarehouseLocation.objects.create(
            name='Main Warehouse',
            code='MAIN',
        )
        StockItem.objects.create(
            product=product,
            warehouse_location=warehouse,
            quantity_on_hand=Decimal('20'),
            safety_stock_level=Decimal('100'),
        )
        QuoteRequest.objects.create(
            product=product,
            quantity=Decimal('5'),
            unit_of_measure='L',
            full_name='Jane Buyer',
            email='jane@example.com',
            phone='+254700000000',
            company='Example Industries',
            additional_notes='Urgent',
        )
        ContactMessage.objects.create(
            full_name='John Buyer',
            email='john@example.com',
            company='Example Co',
            message='Please contact me.',
        )
        session = ChatSession.objects.create(session_id='session-1')
        ChatMessage.objects.create(session=session, role='user', content='Do you stock acetone?')
        BlogPost.objects.create(title='Chemical Safety', content='Use PPE.', author=self.admin)
        SeoPage.objects.create(page='/products', meta_title='Products', meta_description='Catalog')
        PageView.objects.create(page='/products/acetone', device='desktop')
        WhatsAppClick.objects.create(source_page='/products/acetone')
        PhoneClick.objects.create(source_page='/contact')

        response = self.client.get('/api/v1/admin/overview/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('metrics', response.data)
        self.assertEqual(response.data['inventoryAlerts'][0]['productName'], 'Acetone')
        self.assertEqual(response.data['quoteRequests'][0]['notes'], 'Urgent')
        self.assertEqual(response.data['conversations'][0]['question'], 'Do you stock acetone?')
