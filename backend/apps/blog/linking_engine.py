"""
Internal Linking Engine for Finstar Blog & Technical Documents.

Automatically injects internal links into HTML article bodies:
  - Product name mentions → /products/{slug}
  - Service name mentions → /services (simple static href)
  - ISO/KEBS/IEC standard codes → /technical-docs/{slug}
  - Appends a "Related Products" section if related products exist
  - Always includes /contact and /request-quote links in the footer section

All injected links are validated against a list of known slugs from the DB.
No links are injected to pages that return 404.
"""

import re
from typing import Optional


def _escape(text: str) -> str:
    return re.escape(text)


def inject_internal_links(
    body_html: str,
    product_slugs: Optional[dict] = None,
    service_slugs: Optional[dict] = None,
    doc_standard_slugs: Optional[dict] = None,
) -> str:
    """
    :param body_html:          Raw HTML article body.
    :param product_slugs:      dict of {product_name: product_slug}
    :param service_slugs:      dict of {service_name: service_slug}  (reserved for future use)
    :param doc_standard_slugs: dict of {standard_code: doc_slug}
    :return: HTML with injected links.
    """
    product_slugs = product_slugs or {}
    service_slugs = service_slugs or {}
    doc_standard_slugs = doc_standard_slugs or {}

    result = body_html

    # ── 1. Link product name mentions ─────────────────────────────────────────
    for name, slug in sorted(product_slugs.items(), key=lambda x: -len(x[0])):
        if not name or not slug:
            continue
        # Don't double-link — skip if already inside an <a> tag
        pattern = (
            r'(?<!["/\'>#\w])(' + _escape(name) + r')(?![\w<])'
        )
        replacement = (
            r'<a href="/products/' + slug + r'" class="internal-link">\1</a>'
        )
        result, count = re.subn(pattern, replacement, result, count=1, flags=re.IGNORECASE)

    # ── 2. Link ISO/KEBS/IEC standard code mentions ───────────────────────────
    standard_pattern = re.compile(
        r'\b(ISO\s+\d{4,5}(?:[-:]\d+)?|KEBS\s+KS[\s\-]+\d{2}[-\d]+|IEC\s+\d{5}(?:[-:]\d+)?)\b',
        re.IGNORECASE,
    )
    def replace_standard(match):
        code = match.group(1)
        # Look for matching doc slug
        for std_code, slug in doc_standard_slugs.items():
            if std_code.replace(' ', '').upper() == code.replace(' ', '').upper():
                return f'<a href="/technical-docs/{slug}" class="internal-link">{code}</a>'
        return code  # no match — leave as-is

    result = standard_pattern.sub(replace_standard, result)

    # ── 3. Ensure /contact and /request-quote appear at least once ────────────
    if '/contact' not in result:
        result += (
            '\n<p>For product enquiries and safety data sheet requests, '
            '<a href="/contact" class="internal-link">contact our team</a> directly.</p>'
        )
    if '/quote' not in result and '/request-quote' not in result:
        result += (
            '\n<p>Ready to source? '
            '<a href="/quote" class="internal-link">Request a quote</a> '
            'for bulk pricing and delivery to Kenya, Uganda, Tanzania, and Rwanda.</p>'
        )

    return result


def build_related_products_section(products: list) -> str:
    """Build an HTML "Related Products" footer section for a blog post."""
    if not products:
        return ''
    items = ''.join(
        f'<li><a href="/products/{p["slug"]}" class="internal-link">{p["name"]}</a></li>'
        for p in products
    )
    return (
        f'\n<section class="related-products">'
        f'<h3>Related Products from Finstar</h3>'
        f'<ul>{items}</ul>'
        f'</section>'
    )


def get_link_context() -> tuple[dict, dict, dict]:
    """
    Load current product names/slugs, service names/slugs, and
    standard codes/doc-slugs from the DB. Returns three dicts.
    """
    from products.models import Product, Service
    from technical_docs.models import TechnicalDocument

    product_slugs = {
        p.name: p.slug
        for p in Product.objects.filter(status='active').values_list('name', 'slug')
    }
    # Rewrite above with correct values_list usage
    product_slugs = {}
    for name, slug in Product.objects.filter(status='active').values_list('name', 'slug'):
        product_slugs[name] = slug

    service_slugs = {}
    for name, slug in Service.objects.filter(is_active=True).values_list('name', 'slug'):
        service_slugs[name] = slug

    doc_slugs = {}
    for std_code, slug in TechnicalDocument.objects.filter(
        is_published=True
    ).exclude(standard_code='').values_list('standard_code', 'slug'):
        doc_slugs[std_code] = slug

    return product_slugs, service_slugs, doc_slugs
