"""
Delivery-time watermark URL construction.

The watermark is never baked into the stored Cloudinary asset — every call
here is pure URL-string construction against `cloudinary_public_id`. This
means "restore" is instant and free (just stop calling this function) and
the original asset is never touched.
"""
from cloudinary import CloudinaryImage

import services.cloudinary_service  # noqa: F401 — import side effect: cloudinary.config()


def _overlay_step(text, settings, *, font_size, y=None):
    step = {
        'overlay': {
            'font_family': 'Arial',
            'font_size': font_size,
            'font_weight': 'bold',
            'text': text,
        },
        'color': settings.watermark_color,
        'opacity': settings.watermark_opacity,
        'angle': settings.watermark_angle,
    }
    if settings.watermark_position == 'tiled':
        # Cloudinary's native repeating-overlay flag — tiles the text
        # diagonally across the whole image.
        step['flags'] = 'tiled'
    else:
        step['gravity'] = 'center'
        if y is not None:
            step['y'] = y
    return step


def build_watermark_transformation(settings):
    """Build the Cloudinary transformation chain for the current watermark design."""
    text = (settings.watermark_text or '').strip()
    secondary = (settings.watermark_secondary_text or '').strip()

    if not text and not secondary:
        return []

    if settings.watermark_position == 'tiled':
        # Combine onto a single line (no literal newline in a Cloudinary text
        # layer) rather than fight text-layer newline encoding.
        combined = text if not secondary else f'{text}  •  {secondary}'
        return [_overlay_step(combined, settings, font_size=settings.watermark_font_size)]

    steps = []
    if text:
        y_offset = -(settings.watermark_font_size // 2) if secondary else None
        steps.append(_overlay_step(text, settings, font_size=settings.watermark_font_size, y=y_offset))
    if secondary:
        secondary_font_size = max(10, int(settings.watermark_font_size * 0.6))
        y_offset = (settings.watermark_font_size // 2) if text else None
        steps.append(_overlay_step(secondary, settings, font_size=secondary_font_size, y=y_offset))
    return steps


def build_watermark_url(public_id, settings):
    """Compute the effective watermarked delivery URL for a Cloudinary asset."""
    transformation = build_watermark_transformation(settings)
    if not transformation:
        return CloudinaryImage(public_id).build_url(secure=True)
    return CloudinaryImage(public_id).build_url(transformation=transformation, secure=True)
