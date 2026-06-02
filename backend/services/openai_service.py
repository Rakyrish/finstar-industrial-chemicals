import os
import json
from openai import OpenAI
from products.models import Product
from django.conf import settings


class OpenAIService:
    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', os.getenv('OPENAI_API_KEY', ''))
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def _client(self):
        if not self.client:
            raise RuntimeError('OPENAI_API_KEY is not configured on the backend.')
        return self.client

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
                "outbound_authority_links": string_list,
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
                "cta_content", "schema_markup", "internal_linking", "outbound_authority_links",
                "structured_data_notes",
                "safety_considerations", "industrial_classification", "chemical_classification",
            ],
            "additionalProperties": False,
        }

    # ──────────────────────────────────────────────────────────────────────────
    # Chatbot
    # ──────────────────────────────────────────────────────────────────────────
    def _fallback_chat_response(self, messages, inventory_lines):
        last_message = ''
        for message in reversed(messages):
            if message.get('role') == 'user':
                last_message = message.get('content', '')
                break

        product_names = []
        for line in inventory_lines[:6]:
            name = line.split(' (CAS:', 1)[0].replace('- ', '').strip()
            if name:
                product_names.append(name)

        catalog_hint = (
            f"Current listed products include: {', '.join(product_names)}."
            if product_names
            else "The live catalogue is still being expanded."
        )

        return {
            'role': 'assistant',
            'content': (
                "I can help with industrial chemical availability, quote preparation, SDS/COA guidance, "
                "and product category discovery for Kenya, Uganda, Tanzania, and Rwanda.\n\n"
                f"{catalog_hint}\n\n"
                "Finstar's wider company website also lists common categories such as solvents and thinners, "
                "paints and coatings, cleaning and disinfection chemicals, cosmetics/pharmaceutical/food additives, "
                "rubber and plastic industry chemicals, textile and automotive chemicals, water treatment chemicals, "
                "and lubricants/industrial oils. If a product is not yet listed here, share the product name, grade, "
                "quantity, and delivery country so the team can confirm sourcing and pricing.\n\n"
                "For urgent help, use WhatsApp, call +254 726 417966, or request a quote from the website."
            ),
        }

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

        company_reference = """Company reference:
- Finstar Industrial Chemicals is the chemical supply arm associated with Finstar Industrial Systems Limited.
- The wider company website at https://industrialchem.finstarindustrial.com/ lists industrial chemicals for manufacturing, coatings, cleaning, water treatment, food/cosmetics/pharmaceutical applications, rubber/plastics, textile/automotive uses, solvents/thinners, and industrial oils.
- Examples from the wider company site include Acetone, Butyl Glycol, Ethyl Acetate, Citric Acid, Dextrose Monohydrate, Formalin, Hydrochloric Acid, Acetic Acid, Mono Ethylene Glycol, Caustic Soda Flakes, Calcium Hypochlorite, Xylene, Titanium Dioxide, Nonyl Phenol 9, White Oil, and related industrial chemicals.
- Use that wider website as secondary company context only. If the active catalogue below does not list a product, say it may be available through Finstar's wider sourcing network and ask for grade, quantity, delivery country, and intended application before promising availability.
- Main contact signal from the wider site: +254 726 417966.
"""

        system_prompt = f"""You are Finstar AI, a certified industrial chemical sales and sourcing assistant.
We source and distribute bulk industrial chemicals, reagents, acids, and solvents in Kenya, Uganda, Tanzania, and Rwanda.
Strictly adhere to the following active real-time inventory catalog when answering user requests:
{context_str}

{company_reference}

Rules:
1. If asked about stock, refer strictly to the real-time stock levels listed above.
2. If asked about quote requests or purchases, direct users to use the Quote Wizard (/quote).
3. For MSDS/COA documents, state they are available on the Product Detail page or via Quote Wizard.
4. Keep explanations concise, professional, and safety-focused.
5. Always remind clients to wear appropriate PPE when handling hazardous substances.
6. For products not found in the active catalogue, mention Finstar's wider company chemical website may include or source related products, then ask for product name, grade, quantity, and delivery location.
7. Do not invent exact prices, live availability, SDS links, purity, or certification claims.
8. Align answers to industrial chemical procurement, B2B supply, compliance, packaging, delivery, and quotation support.
"""

        full_messages = [{'role': 'system', 'content': system_prompt}] + messages

        try:
            response = self._client().chat.completions.create(
                model=os.getenv('OPENAI_CHAT_MODEL', 'gpt-4.1-mini'),
                messages=full_messages,
                temperature=0.2,
                max_tokens=400,
            )
            return {
                'role': 'assistant',
                'content': response.choices[0].message.content,
            }
        except Exception as e:
            return self._fallback_chat_response(messages, inventory_lines)

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
        name_instruction = (
            f"The product is: '{product_name}'."
            if product_name
            else "First identify the product from the image, then use that as the basis for all content."
        )

        prompt = f"""You are a senior chemical industry marketing strategist, industrial chemist, SEO specialist, technical copywriter, and B2B product analyst for Finstar Industrial Chemicals.
{name_instruction}
Generate comprehensive product database content for the Finstar Chemicals website, optimized for:
- Google Search, Bing Search
- AI Search Engines: ChatGPT Search, Perplexity AI, Gemini Search
- Featured Snippets (structured answers)
- Voice Search (conversational phrasing)
- Industrial/B2B chemical product search in Kenya, Uganda, Tanzania, and Rwanda
- Product catalogue browsing and procurement teams

Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):

{{
  "product_name": "SEO product name. Format: [Correct Chemical Name] for Industrial Buyers in Kenya, Uganda, Tanzania, and Rwanda",
  "seo_title": "Max 90 chars. Must include Kenya, Uganda, Tanzania & Rwanda. Format: Buy [Name] in Kenya, Uganda, Tanzania & Rwanda | Finstar",
  "seo_meta_description": "120-155 chars. Must include Finstar Chemicals, Kenya, Uganda, Tanzania, Rwanda, and a quote CTA",
  "short_description": "180-220 chars. Professional summary mentioning Finstar Chemicals plus Kenya, Uganda, Tanzania, and Rwanda",
  "long_description": "4-6 plain-text paragraphs. Technical but accessible. Mention uses, handling, applications, supply regions, and procurement value. Do not return HTML here. Do not mention purity or density.",
  "technical_specifications": [{{"key": "CAS Number", "value": "XXXX-XX-X"}}, {{"key": "Chemical Formula", "value": "H2O"}}, {{"key": "Appearance", "value": "Clear liquid"}}, {{"key": "Packaging", "value": "Drums, IBCs, bags, or bulk supply where applicable"}}, {{"key": "Storage", "value": "Cool, dry, ventilated chemical storage"}}],
  "applications": ["Specific industrial application 3", "Specific industrial application 2", "Specific industrial application 3", "Specific industrial application 4", "Specific industrial application 5"],
  "benefits": ["Procurement or operational benefit 3", "Quality or compliance benefit 2", "Supply-chain benefit 3"],
  "features": ["Grade or packaging feature 2", "Handling or compatibility feature 3", "Documentation feature 3"],
  "industries_served": ["Water Treatment", "Manufacturing", "Food Processing", "Laboratories"],
  "faqs": [{{"q": "Where can I buy [product] in Kenya?", "a": "Finstar Chemicals supplies [product] for industrial buyers in Kenya, Uganda, Tanzania, and Rwanda. Request a quote for pricing and availability."}}, {{"q": "Is a Certificate of Analysis available?", "a": "Yes, COA and batch documentation are available upon request for qualified industrial orders."}}],
  "seo_keywords": ["[product] supplier Kenya", "[product] Uganda", "[product] Tanzania", "[product] Rwanda", "industrial chemicals Kenya", "chemical suppliers Kenya"],
  "product_tags": ["chemical class", "industry", "grade"],
  "seo_slug": "product-name-industrial-grade.Must include Finstar Chemicals, Kenya, Uganda, Tanzania, Rwanda",
  "og_description": "Max 200 chars. OpenGraph social share description",
  "twitter_description": "Max 200 chars. Twitter card description",
  "image_alt": "Descriptive alt text for the product image, max 125 chars.Must include Finstar Chemicals, Kenya, Uganda, Tanzania, Rwanda",
  "image_title": "Image title attribute, max 125 chars",
  "image_caption": "Optional image caption for use in galleries",
  "whatsapp_template": "Hello Finstar, I am interested in [product_name]. Please send me pricing and availability.",
  "quotation_template": "Dear Finstar Team,\\n\\nI would like to request a quotation for [product_name].\\n\\nQuantity required: \\nDelivery location: \\nSpecial requirements: \\n\\nThank you.",
  "cta_content": "Request a Quote for {{product_name}} Today",
  "schema_markup": {{"@context": "https://schema.org", "@type": "Product", "name": "{{product_name}}", "description": "..."}},
  "internal_linking": ["Use exact format: Anchor Text | /products?category=category-slug", "Use exact format: Request a Quote | /quote", "Use exact format: Chemical Safety Guides | /blog"],
  "outbound_authority_links": ["Use exact format: Wikipedia - [Product Name] | https://en.wikipedia.org/wiki/Special:Search?search=[encoded product name]", "Use exact format: PubChem - [Product Name] | https://pubchem.ncbi.nlm.nih.gov/#query=[encoded product name]"],
  "structured_data_notes": "Brief recommendation on schema implementation",
  "safety_considerations": ["PPE requirement", "Storage requirement", "Handling or spill-control requirement"],
  "industrial_classification": "Industrial chemical classification",
  "chemical_classification": "Chemical family or class"
}}

SEO REQUIREMENTS:
- Product name must include Kenya, Uganda, Tanzania, and Rwanda.
- SEO title must include Kenya, Uganda, Tanzania & Rwanda.
- Write content a human expert would write, not generic filler.
- FAQ questions should use exact phrases people type into Google/ChatGPT, such as "where to buy X in Kenya", "X price per kg", "X supplier in Uganda", "X distributor in Tanzania", and "X in Rwanda".
- Include safety and compliance information where relevant ( REACH)
- Target B2B industrial buyers in Kenya, Uganda, Tanzania, and Rwanda.
- Mention Finstar Chemicals naturally in product descriptions and buyer-facing templates.
- Include internal links to relevant product category pages, /products, /quote, and /blog where useful.
- Include outbound authority links only from credible educational sources such as Wikipedia, PubChem, WHO, OSHA, EPA, CDC, or ECHA.
- Never invent CAS numbers, hazard classes, or certifications. Use "Not specified" when unclear.
- Do not include density, purity, assay, concentration percentage, or purity percentage in any field.
- Do not include technical_specifications entries with keys such as "Density", "Purity", "Assay", "Concentration", or "Specific Gravity".

FRONTEND DISPLAY REQUIREMENTS:
- Keep long_description as plain text paragraphs so the website can display clean readable sections.
- Put scannable facts in technical_specifications, applications, benefits, features, industries_served, faqs, safety_considerations, internal_linking, and outbound_authority_links.
- Do not place raw HTML in long_description, short_description, FAQs, features, benefits, or applications.
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
            client = self._client()
            if hasattr(client, 'responses'):
                response = client.responses.create(
                    model=os.getenv('OPENAI_PRODUCT_MODEL', 'gpt-4.1-mini'),
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

            response = client.chat.completions.create(
                model=os.getenv('OPENAI_PRODUCT_MODEL', 'gpt-4.1-mini'),
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
            raise ValueError('OpenAI returned invalid product JSON. Please retry with a clearer product image or name.') from e
        except Exception as e:
            print(f'OpenAI product generation error: {e}')
            raise e


# Singleton instance
openai_service = OpenAIService()
