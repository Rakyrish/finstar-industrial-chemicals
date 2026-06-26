"""
Management command: seed_technical_docs
Run once at deployment to seed 8 technical reference documents and auto-generate
data sheets for all active products via OpenAI.

Usage:
    python manage.py seed_technical_docs
    python manage.py seed_technical_docs --skip-products   (skip per-product data sheets)
"""
import time

from django.core.management.base import BaseCommand

SEED_DOCS = [
    {
        'doc_type':      'iso_guide',
        'standard_code': 'ISO 9001:2015',
        'title':         'ISO 9001:2015 — Quality Management in Chemical Supply Chains',
        'topic':         'ISO 9001:2015 quality management system requirements for chemical suppliers and distributors in Kenya and East Africa. Include audit requirements, supplier qualification, and batch traceability.',
    },
    {
        'doc_type':      'iso_guide',
        'standard_code': 'ISO 45001:2018',
        'title':         'ISO 45001:2018 — Occupational Health & Safety for Chemical Facilities',
        'topic':         'ISO 45001:2018 occupational health and safety management system for chemical manufacturing, storage, and distribution facilities in East Africa.',
    },
    {
        'doc_type':      'iso_guide',
        'standard_code': 'ISO 14001:2015',
        'title':         'ISO 14001:2015 — Environmental Management for Chemical Operations',
        'topic':         'ISO 14001:2015 environmental management systems for industrial chemical companies operating in Kenya, Uganda, Tanzania, and Rwanda.',
    },
    {
        'doc_type':      'kebs_guide',
        'standard_code': 'KEBS KS 04-136',
        'title':         'KEBS Standards for Chemical Products in Kenya — Compliance Guide',
        'topic':         'Kenya Bureau of Standards (KEBS) compliance requirements for industrial chemical products, import regulations, and product registration in Kenya.',
    },
    {
        'doc_type':      'kebs_guide',
        'standard_code': 'GHS Rev.9',
        'title':         'GHS & SDS Requirements for Industrial Chemicals — Kenya Context',
        'topic':         'Globally Harmonised System (GHS) classification and labelling of chemicals and Safety Data Sheet (SDS) requirements for industrial chemicals in Kenya.',
    },
    {
        'doc_type':      'datasheet',
        'standard_code': 'GHS/SDS',
        'title':         'Industrial Cleaning Agents — Product Technical Data Sheet',
        'topic':         'Technical data sheet for industrial cleaning agents including degreasers, alkaline cleaners, and acid descalers used in manufacturing, food processing, and water treatment facilities in Kenya.',
    },
    {
        'doc_type':      'datasheet',
        'standard_code': 'GHS/SDS',
        'title':         'Corrosion Inhibitors & Surface Treatment Chemicals — Specifications',
        'topic':         'Technical specifications for corrosion inhibitors, passivation chemicals, and surface treatment agents for industrial equipment protection in East African industrial facilities.',
    },
    {
        'doc_type':      'datasheet',
        'standard_code': 'GHS/SDS',
        'title':         'Water Treatment Chemicals — Technical Specifications & Dosage Guide',
        'topic':         'Technical specifications, dosage guide, and safety data for water treatment chemicals including coagulants, flocculants, pH adjusters, and disinfectants for industrial water systems in Kenya.',
    },
]


class Command(BaseCommand):
    help = 'Seed 8 technical reference documents and generate product data sheets via OpenAI.'

    def add_arguments(self, parser):
        parser.add_argument('--skip-products', action='store_true', help='Skip generating per-product data sheets.')
        parser.add_argument('--dry-run', action='store_true')

    def handle(self, *args, **options):
        from technical_docs.models import TechnicalDocument
        from services.openai_service import openai_service

        skip_products = options.get('skip_products', False)
        dry_run = options.get('dry_run', False)
        created = 0

        # ── 1. Seed static documents ─────────────────────────────────────────
        self.stdout.write('\n📚  Seeding technical documents...\n')
        for doc_spec in SEED_DOCS:
            if TechnicalDocument.objects.filter(title=doc_spec['title']).exists():
                self.stdout.write(f'  ↷  Exists: {doc_spec["title"][:60]}')
                continue

            self.stdout.write(f'  Generating: {doc_spec["title"][:60]}...')
            try:
                prompt = (
                    f'You are a senior chemical industry technical writer at Finstar Industrial Chemicals.\n\n'
                    f'Write a complete, professional technical document:\n'
                    f'Title: {doc_spec["title"]}\n'
                    f'Standard: {doc_spec["standard_code"]}\n'
                    f'Topic: {doc_spec["topic"]}\n\n'
                    f'Format as HTML body (minimum 1200 words). Include:\n'
                    f'- Scope and purpose\n- Key requirements or specifications\n'
                    f'- Kenya / East Africa context\n- Compliance checklist\n'
                    f'- References to ISO.org, KEBS, or IEC with rel="noopener noreferrer" target="_blank"\n'
                    f'- Links to /contact and /quote\n\n'
                    f'Return JSON: {{"title":"...","slug":"...","meta_title":"...","meta_description":"...","excerpt":"...","body_html":"...","standard_code":"...","doc_type":"{doc_spec["doc_type"]}"}}'
                )
                from openai import OpenAI
                import os, json
                from django.conf import settings
                client = OpenAI(api_key=getattr(settings, 'OPENAI_API_KEY', ''))
                resp = client.chat.completions.create(
                    model=os.getenv('OPENAI_BLOG_MODEL', 'gpt-4o-mini'),
                    messages=[
                        {'role': 'system', 'content': 'Return only valid JSON. Never use markdown.'},
                        {'role': 'user', 'content': prompt},
                    ],
                    temperature=0.3,
                    max_tokens=3000,
                    response_format={'type': 'json_object'},
                )
                data = json.loads(resp.choices[0].message.content)
            except Exception as exc:
                self.stderr.write(f'  ✗ Failed: {exc}')
                time.sleep(2)
                continue

            if dry_run:
                self.stdout.write(f'  [DRY-RUN] Would create: {data.get("title", doc_spec["title"])}')
                continue

            TechnicalDocument.objects.create(
                title=data.get('title', doc_spec['title'])[:200],
                doc_type=doc_spec['doc_type'],
                standard_code=data.get('standard_code', doc_spec['standard_code'])[:80],
                meta_title=(data.get('meta_title') or '')[:70],
                meta_description=(data.get('meta_description') or '')[:160],
                excerpt=(data.get('excerpt') or '')[:300],
                body_html=data.get('body_html', ''),
                is_published=True,
            )
            created += 1
            self.stdout.write(self.style.SUCCESS(f'  ✓ {doc_spec["title"][:60]}'))
            time.sleep(1)

        # ── 2. Generate data sheets for all active products ───────────────────
        if not skip_products:
            self.stdout.write('\n⚗️   Generating product data sheets...\n')
            from products.models import Product
            products = Product.objects.filter(status='active').select_related('category')

            for product in products:
                if TechnicalDocument.objects.filter(
                    title__icontains=product.name, doc_type='datasheet'
                ).exists():
                    self.stdout.write(f'  ↷  Data sheet exists: {product.name[:50]}')
                    continue

                self.stdout.write(f'  Generating data sheet: {product.name[:50]}...')
                try:
                    sheet = openai_service.generate_data_sheet(
                        product_name=product.name,
                        cas_number=product.cas_number or '',
                        chemical_formula=product.chemical_formula or '',
                        category=product.category.name if product.category else '',
                        description=product.short_description or '',
                    )
                except Exception as exc:
                    self.stderr.write(f'  ✗ Failed for {product.name}: {exc}')
                    time.sleep(2)
                    continue

                if dry_run:
                    self.stdout.write(f'  [DRY-RUN] Would create data sheet for: {product.name}')
                    continue

                doc = TechnicalDocument.objects.create(
                    title=sheet.get('title', f'{product.name} — Product Data Sheet')[:200],
                    doc_type='datasheet',
                    standard_code=sheet.get('standard_code', 'GHS/SDS')[:80],
                    meta_title=(sheet.get('meta_title') or '')[:70],
                    meta_description=(sheet.get('meta_description') or '')[:160],
                    excerpt=(sheet.get('excerpt') or '')[:300],
                    body_html=sheet.get('body_html', ''),
                    is_published=True,
                )
                doc.related_products.add(product)
                created += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Data sheet created for: {product.name[:50]}'))
                time.sleep(1)  # Rate-limit politeness

        self.stdout.write(self.style.SUCCESS(f'\n✅  Done. {created} documents created.'))
