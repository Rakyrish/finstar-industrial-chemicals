"""
Content Quality Engine for Finstar Blog & Technical Documents.

Scores an article out of 100 across 9 dimensions.
Minimum to save:    65
Minimum to publish: 80

Usage:
    from blog.quality_engine import quality_engine
    result = quality_engine.score(title, body_html, meta_title, meta_description,
                                  excerpt, faq_items)
    # result = {'score': 82, 'breakdown': {...}, 'passed': True}
"""

import re
from typing import Any


class ContentQualityEngine:

    # ── Weights (must sum to 100) ─────────────────────────────────────────────
    WEIGHTS = {
        'word_count':       5,
        'heading_structure': 10,
        'faq_quality':      10,
        'internal_links':   15,
        'external_links':   10,
        'metadata':         10,
        'technical_refs':   15,
        'readability':      10,
        'grammar':          15,
    }

    APPROVED_EXTERNAL_DOMAINS = [
        'en.wikipedia.org',
        'iso.org',
        'kebs.org',
        'iec.ch',
        'osha.gov',
        'energy.gov',
        'iea.org',
        'who.int',
        'pubchem.ncbi.nlm.nih.gov',
    ]

    STANDARD_PATTERNS = [
        r'\bISO\s+\d{4,5}(?:[-:]\d+)?\b',
        r'\bKEBS\s+KS[\s\-]+\d{2}[-\d]+\b',
        r'\bIEC\s+\d{5}(?:[-:]\d+)?\b',
        r'\bGHS\b',
        r'\bREACH\b',
        r'\bSDS\b',
        r'\bHazmat\b',
    ]

    def score(
        self,
        title: str,
        body_html: str,
        meta_title: str = '',
        meta_description: str = '',
        excerpt: str = '',
        faq_items: list = None,
    ) -> dict[str, Any]:
        faq_items = faq_items or []
        breakdown: dict[str, int] = {}

        # 1. Word count (target 1500–2800)
        words = len(re.sub(r'<[^>]+>', ' ', body_html).split())
        if 1500 <= words <= 2800:
            breakdown['word_count'] = self.WEIGHTS['word_count']
        elif 1200 <= words < 1500 or 2800 < words <= 3200:
            breakdown['word_count'] = round(self.WEIGHTS['word_count'] * 0.5)
        else:
            breakdown['word_count'] = 0

        # 2. Heading structure
        h2_count = len(re.findall(r'<h2[\s>]', body_html, re.IGNORECASE))
        h3_count = len(re.findall(r'<h3[\s>]', body_html, re.IGNORECASE))
        heading_score = 0
        if h2_count >= 4:
            heading_score += round(self.WEIGHTS['heading_structure'] * 0.6)
        elif h2_count >= 2:
            heading_score += round(self.WEIGHTS['heading_structure'] * 0.3)
        if h3_count >= 2:
            heading_score += round(self.WEIGHTS['heading_structure'] * 0.4)
        breakdown['heading_structure'] = min(heading_score, self.WEIGHTS['heading_structure'])

        # 3. FAQ quality
        faq_score = 0
        if len(faq_items) >= 5:
            faq_score += round(self.WEIGHTS['faq_quality'] * 0.5)
            long_answers = sum(
                1 for item in faq_items
                if len(str(item.get('answer', '')).split()) >= 50
            )
            if long_answers >= 3:
                faq_score += round(self.WEIGHTS['faq_quality'] * 0.5)
        breakdown['faq_quality'] = min(faq_score, self.WEIGHTS['faq_quality'])

        # 4. Internal links (links to site-internal paths /products, /contact, /request-quote, /technical-docs)
        internal_pattern = re.compile(
            r'href=["\']/(products|services|contact|request-quote|quote|technical-docs|blog)[^\'"]*["\']',
            re.IGNORECASE,
        )
        internal_count = len(internal_pattern.findall(body_html))
        if internal_count >= 3:
            breakdown['internal_links'] = self.WEIGHTS['internal_links']
        elif internal_count >= 2:
            breakdown['internal_links'] = round(self.WEIGHTS['internal_links'] * 0.6)
        elif internal_count >= 1:
            breakdown['internal_links'] = round(self.WEIGHTS['internal_links'] * 0.3)
        else:
            breakdown['internal_links'] = 0

        # 5. External authority links with correct rel/target
        ext_links_ok = 0
        ext_pattern = re.compile(
            r'<a[^>]+href=["\']https?://([^/\'"]+)["\'][^>]*>',
            re.IGNORECASE,
        )
        for match in ext_pattern.finditer(body_html):
            domain = match.group(1).lower().replace('www.', '')
            if any(approved in domain for approved in self.APPROVED_EXTERNAL_DOMAINS):
                # Verify rel="noopener noreferrer" and target="_blank"
                full_tag = match.group(0)
                if 'noopener' in full_tag and 'target' in full_tag and '_blank' in full_tag:
                    ext_links_ok += 1
        if ext_links_ok >= 2:
            breakdown['external_links'] = self.WEIGHTS['external_links']
        elif ext_links_ok == 1:
            breakdown['external_links'] = round(self.WEIGHTS['external_links'] * 0.5)
        else:
            breakdown['external_links'] = 0

        # 6. Metadata quality
        meta_score = 0
        eff_title = meta_title or title
        if eff_title and len(eff_title) <= 70:
            meta_score += round(self.WEIGHTS['metadata'] * 0.4)
        if meta_description and len(meta_description) <= 160:
            meta_score += round(self.WEIGHTS['metadata'] * 0.4)
        if excerpt and len(excerpt) <= 300:
            meta_score += round(self.WEIGHTS['metadata'] * 0.2)
        breakdown['metadata'] = min(meta_score, self.WEIGHTS['metadata'])

        # 7. Technical references (ISO/KEBS/IEC/GHS/SDS mentions)
        refs_found = 0
        for pattern in self.STANDARD_PATTERNS:
            if re.search(pattern, body_html, re.IGNORECASE):
                refs_found += 1
        if refs_found >= 3:
            breakdown['technical_refs'] = self.WEIGHTS['technical_refs']
        elif refs_found >= 2:
            breakdown['technical_refs'] = round(self.WEIGHTS['technical_refs'] * 0.7)
        elif refs_found >= 1:
            breakdown['technical_refs'] = round(self.WEIGHTS['technical_refs'] * 0.4)
        else:
            breakdown['technical_refs'] = 0

        # 8. Readability (heuristic: average sentence length)
        plain_text = re.sub(r'<[^>]+>', ' ', body_html)
        sentences = re.split(r'[.!?]+', plain_text)
        sentences = [s.strip() for s in sentences if len(s.split()) >= 3]
        if sentences:
            avg_len = sum(len(s.split()) for s in sentences) / len(sentences)
            # Target: 15–25 words per sentence for Grade 10-14
            if 12 <= avg_len <= 28:
                breakdown['readability'] = self.WEIGHTS['readability']
            elif 8 <= avg_len < 12 or 28 < avg_len <= 35:
                breakdown['readability'] = round(self.WEIGHTS['readability'] * 0.6)
            else:
                breakdown['readability'] = round(self.WEIGHTS['readability'] * 0.3)
        else:
            breakdown['readability'] = 0

        # 9. Grammar (heuristic: penalise if common filler phrases or very short paragraphs)
        filler_patterns = [
            r'\bin conclusion\b', r'\bto summarize\b', r'\bfirst and foremost\b',
            r'\bit is worth noting\b', r'\bplease note that\b',
        ]
        filler_count = sum(1 for fp in filler_patterns if re.search(fp, plain_text, re.IGNORECASE))
        grammar_score = self.WEIGHTS['grammar']
        if filler_count >= 3:
            grammar_score = round(grammar_score * 0.5)
        elif filler_count >= 1:
            grammar_score = round(grammar_score * 0.8)
        breakdown['grammar'] = grammar_score

        total = sum(breakdown.values())
        return {
            'score': min(total, 100),
            'breakdown': breakdown,
            'word_count': words,
            'h2_count': h2_count,
            'h3_count': h3_count,
            'faq_count': len(faq_items),
            'internal_links': internal_count,
            'external_links_ok': ext_links_ok,
            'technical_refs': refs_found,
            'passed': total >= 65,
            'publishable': total >= 80,
        }


quality_engine = ContentQualityEngine()
