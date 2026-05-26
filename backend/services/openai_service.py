import os
import json
from openai import OpenAI
from products.models import Product


class OpenAIService:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY', 'mock-key')
        self.client = OpenAI(api_key=self.api_key)

    def _is_mock(self):
        return not self.api_key or self.api_key == 'mock-key'

    def _product_schema(self):
        string_list = {"type": "array", "items": {"type": "string"}}
        qa_list = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"q": {"type": "string"}, "a": {"type": "string"}},
                "required": ["q", "a"],
                "additionalProperties": False,
            },
        }
        kv_list = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"key": {"type": "string"}, "value": {"type": "string"}},
                "required": ["key", "value"],
                "additionalProperties": False,
            },
        }
        return {
            "type": "object",
            "properties": {
                "product_name": {"type": "string"},
                "seo_title": {"type": "string"},
                "seo_meta_description": {"type": "string"},
                "short_description": {"type": "string"},
                "long_description": {"type": "string"},
                "technical_specifications": kv_list,
                "applications": string_list,
                "benefits": string_list,
                "features": string_list,
                "industries_served": string_list,
                "faqs": qa_list,
                "seo_keywords": string_list,
                "product_tags": string_list,
                "seo_slug": {"type": "string"},
                "og_description": {"type": "string"},
                "twitter_description": {"type": "string"},
                "image_alt": {"type": "string"},
                "image_title": {"type": "string"},
                "image_caption": {"type": "string"},
                "whatsapp_template": {"type": "string"},
                "quotation_template": {"type": "string"},
                "cta_content": {"type": "string"},
                "schema_markup": {
                    "type": "object",
                    "properties": {
                        "@context": {"type": "string"},
                        "@type": {"type": "string"},
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                    },
                    "required": ["@context", "@type", "name", "description"],
                    "additionalProperties": False,
                },
                "internal_linking": string_list,
                "product_category_suggestions": string_list,
                "structured_data_notes": {"type": "string"},
                "safety_considerations": string_list,
                "industrial_classification": {"type": "string"},
                "chemical_classification": {"type": "string"},
            },
            "required": [
                "product_name", "seo_title", "seo_meta_description", "short_description",
                "long_description", "technical_specifications", "applications", "benefits",
                "features", "industries_served", "faqs", "seo_keywords", "product_tags",
                "seo_slug", "og_description", "twitter_description", "image_alt",
                "image_title", "image_caption", "whatsapp_template", "quotation_template",
                "cta_content", "schema_markup", "internal_linking",
                "product_category_suggestions", "structured_data_notes",
                "safety_considerations", "industrial_classification", "chemical_classification",
            ],
            "additionalProperties": False,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Chatbot
    # ──────────────────────────────────────────────────────────────────────────
    def generate_chat_response(self, messages):
        """
        Takes conversation history list: [{'role': 'user', 'content': '...'}, ...]
        Injects a real-time inventory context system prompt.
        """
        products = Product.objects.filter(status='active')
        inventory_lines = []
        for p in products:
            stock = getattr(p, 'stock_item', None)
            qty = float(stock.quantity_on_hand) if stock else 0.0
            inventory_lines.append(
                f'- {p.name} (CAS: {p.cas_number or "N/A"}, '
                f'Formula: {p.chemical_formula or "N/A"}): '
                f'Purity: {p.purity or "N/A"}, Stock: {qty} {p.unit_of_measure}, '
                f'Min Order: {p.min_order_quantity} {p.unit_of_measure}'
            )

        context_str = '\n'.join(inventory_lines) if inventory_lines else 'No products currently listed.'

        system_prompt = f"""You are Finstar AI, a certified industrial chemical database assistant.
We source and distribute bulk industrial chemicals, reagents, acids, and solvents in East Africa.
Strictly adhere to the following active real-time inventory catalog when answering user requests:
{context_str}

Rules:
1. If asked about stock, refer strictly to the real-time stock levels listed above.
2. If asked about quote requests or purchases, direct users to use the Quote Wizard (/quote).
3. For MSDS/COA documents, state they are available on the Product Detail page or via Quote Wizard.
4. Keep explanations concise, professional, and safety-focused.
5. Always remind clients to wear appropriate PPE when handling hazardous substances.
"""

        full_messages = [{'role': 'system', 'content': system_prompt}] + messages

        if self._is_mock():
            last = messages[-1]['content'] if messages else ''
            return {
                'role': 'assistant',
                'content': (
                    f'[DEBUG MOCK] Thank you for asking about \'{last}\'. '
                    'We stock high-purity industrial compounds under ISO 9001 quality guidelines. '
                    'Please use our Quote Wizard (/quote) to obtain pricing specifications.'
                ),
            }

        try:
            response = self.client.chat.completions.create(
                model='gpt-4o',
                messages=full_messages,
                temperature=0.2,
                max_tokens=400,
            )
            return {
                'role': 'assistant',
                'content': response.choices[0].message.content,
            }
        except Exception as e:
            return {
                'role': 'assistant',
                'content': f'I encountered an error: {e}. Please try again shortly.',
            }

    # ──────────────────────────────────────────────────────────────────────────
    # Product Content Generation (27 fields)
    # ──────────────────────────────────────────────────────────────────────────
    def generate_product_content(self, image_url=None, product_name=None):
        """
        Uses GPT-4o Vision to generate comprehensive product content.
        Either image_url or product_name (or both) must be provided.
        When only image_url is given, AI identifies the product from the image.
        Returns a dict with 27 SEO and content fields.
        """
        if self._is_mock():
            return self._mock_product_content(product_name or 'Industrial Chemical')

        name_instruction = (
            f"The product is: '{product_name}'."
            if product_name
            else "First identify the product from the image, then use that as the basis for all content."
        )

        prompt = f"""You are a professional chemical engineer, B2B content strategist, and enterprise SEO expert.
{name_instruction}
Generate comprehensive product database content optimized for:
- Google Search, Bing Search
- AI Search Engines: ChatGPT Search, Perplexity AI, Gemini Search
- Featured Snippets (structured answers)
- Voice Search (conversational phrasing)
- Industrial/B2B chemical product search in East Africa

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):

{{
  "product_name": "Corrected/proper chemical name of the product",
  "seo_title": "Max 60 chars. Format: Buy [Name] in Bulk | Industrial Grade | Finstar Chemicals",
  "seo_meta_description": "Max 155 chars. Compelling, keyword-rich, includes call to action",
  "short_description": "Max 200 chars. Professional 1-sentence summary",
  "long_description": "3-4 paragraphs. Technical but accessible. Mentions uses, handling, purity, applications",
  "technical_specifications": [{{"key": "CAS Number", "value": "XXXX-XX-X"}}, {{"key": "Chemical Formula", "value": "H2O"}}, {{"key": "Purity", "value": "99.9%"}}, {{"key": "Appearance", "value": "Clear liquid"}}, {{"key": "Density", "value": "1.0 g/mL"}}],
  "applications": ["Application 1", "Application 2", "Application 3", "Application 4", "Application 5"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "industries_served": ["Manufacturing", "Pharmaceuticals", "Agriculture"],
  "faqs": [{{"q": "What is the minimum order quantity?", "a": "Our minimum order is 25kg. Contact us for bulk pricing."}}, {{"q": "Is a Certificate of Analysis available?", "a": "Yes, COA is available for all batches upon request."}}],
  "seo_keywords": ["industrial chemical", "bulk supplier", "keyword3"],
  "product_tags": ["tag1", "tag2", "tag3"],
  "seo_slug": "product-name-industrial-grade",
  "og_description": "Max 200 chars. OpenGraph social share description",
  "twitter_description": "Max 200 chars. Twitter card description",
  "image_alt": "Descriptive alt text for the product image, max 125 chars",
  "image_title": "Image title attribute, max 125 chars",
  "image_caption": "Optional image caption for use in galleries",
  "whatsapp_template": "Hello Finstar, I am interested in [product_name]. Please send me pricing and availability.",
  "quotation_template": "Dear Finstar Team,\\n\\nI would like to request a quotation for [product_name].\\n\\nQuantity required: \\nDelivery location: \\nSpecial requirements: \\n\\nThank you.",
  "cta_content": "Request a Quote for {{product_name}} Today",
  "schema_markup": {{"@context": "https://schema.org", "@type": "Product", "name": "{{product_name}}", "description": "...", "brand": {{"@type": "Brand", "name": "Finstar Industrial Chemicals"}}}},
  "internal_linking": ["Link to /products/category for related chemicals", "Link to /blog for usage guides"],
  "product_category_suggestions": ["Solvents", "Acids", "Reagents"],
  "structured_data_notes": "Brief recommendation on schema implementation"
}}

SEO REQUIREMENTS:
- Write content a human expert would write — not generic filler
- FAQ questions should use exact phrases people type into Google/ChatGPT (e.g., "where to buy X in Kenya", "X price per kg")
- Include safety and compliance information where relevant (GHS, KEBS, REACH)
- Target B2B industrial buyers in East Africa (Kenya, Uganda, Tanzania, Rwanda)
"""

        messages = [
            {'role': 'system', 'content': 'You are a helpful API that returns only valid JSON objects. Never use markdown code blocks.'},
        ]

        if image_url:
            messages.append({
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': prompt},
                    {'type': 'image_url', 'image_url': {'url': image_url, 'detail': 'auto'}},
                ],
            })
        else:
            messages.append({'role': 'user', 'content': prompt})

        try:
            if hasattr(self.client, 'responses'):
                response = self.client.responses.create(
                    model=os.getenv('OPENAI_PRODUCT_MODEL', 'gpt-4o'),
                    input=[{
                        'role': 'user',
                        'content': [
                            {'type': 'input_text', 'text': prompt},
                            *([{'type': 'input_image', 'image_url': image_url, 'detail': 'auto'}] if image_url else []),
                        ],
                    }],
                    text={
                        'format': {
                            'type': 'json_schema',
                            'name': 'finstar_product_profile',
                            'schema': self._product_schema(),
                            'strict': True,
                        }
                    },
                )
                return json.loads(response.output_text)

            response = self.client.chat.completions.create(
                model=os.getenv('OPENAI_PRODUCT_MODEL', 'gpt-4o'),
                messages=messages,
                temperature=0.3,
                max_tokens=2500,
            )
            content = response.choices[0].message.content.strip()

            # Strip any accidental markdown code fences
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            if content.endswith('```'):
                content = content[:-3]

            return json.loads(content.strip())
        except json.JSONDecodeError as e:
            print(f'OpenAI JSON parse error: {e}')
            return self._mock_product_content(product_name or 'Industrial Chemical')
        except Exception as e:
            print(f'GPT-4o Vision API error: {e}')
            raise e

    def _mock_product_content(self, product_name):
        """Fallback mock data when OpenAI is not configured."""
        slug = product_name.lower().replace(' ', '-')
        return {
            'product_name': product_name,
            'seo_title': f'Buy {product_name} in Bulk | Industrial Grade | Finstar Chemicals',
            'seo_meta_description': f'Order premium {product_name} in bulk from Finstar Industrial Chemicals. Fast delivery across East Africa. Contact us for pricing.',
            'short_description': f'High-grade {product_name} for industrial applications. Available in bulk quantities.',
            'long_description': f'{product_name} is a versatile industrial chemical widely used in manufacturing and synthesis. It exhibits excellent stability under standard conditions. Finstar supplies this product in bulk quantities with full documentation including COA and MSDS sheets.',
            'technical_specifications': [
                {'key': 'CAS Number', 'value': 'N/A'},
                {'key': 'Purity', 'value': '≥99%'},
                {'key': 'Appearance', 'value': 'Refer to datasheet'},
            ],
            'applications': ['Industrial manufacturing', 'Chemical synthesis', 'Laboratory use'],
            'benefits': ['High purity grade', 'Bulk quantities available', 'Full documentation provided'],
            'features': ['ISO 9001 certified', 'East Africa delivery', 'Technical support'],
            'industries_served': ['Manufacturing', 'Pharmaceuticals', 'Agriculture', 'Mining'],
            'faqs': [
                {'q': 'What is the minimum order quantity?', 'a': 'Minimum order is 25kg. Contact us for bulk pricing.'},
                {'q': 'Is a Certificate of Analysis available?', 'a': 'Yes, COA is available for all batches upon request.'},
            ],
            'seo_keywords': [product_name.lower(), 'industrial chemical', 'bulk supplier', 'East Africa'],
            'product_tags': ['industrial', 'bulk', 'chemical'],
            'seo_slug': slug,
            'og_description': f'Premium {product_name} available in bulk. Trusted supplier in East Africa.',
            'twitter_description': f'Order {product_name} in bulk from Finstar Chemicals. Industrial grade. East Africa delivery.',
            'image_alt': f'{product_name} industrial grade chemical product',
            'image_title': f'{product_name} | Finstar Industrial Chemicals',
            'image_caption': f'{product_name} available in bulk quantities',
            'whatsapp_template': f'Hello Finstar, I am interested in {product_name}. Please send me pricing and availability.',
            'quotation_template': f'Dear Finstar Team,\n\nI would like to request a quotation for {product_name}.\n\nQuantity required: \nDelivery location: \nSpecial requirements: \n\nThank you.',
            'cta_content': f'Request a Quote for {product_name} Today',
            'schema_markup': {
                '@context': 'https://schema.org',
                '@type': 'Product',
                'name': product_name,
                'brand': {'@type': 'Brand', 'name': 'Finstar Industrial Chemicals'},
            },
            'internal_linking': ['Link to /products for full catalog'],
            'product_category_suggestions': ['Industrial Chemicals'],
            'structured_data_notes': 'Add Product schema to the product detail page.',
        }


# Singleton instance
openai_service = OpenAIService()
