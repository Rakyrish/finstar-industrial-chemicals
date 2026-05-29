import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from django.conf import settings

# Initialize cloudinary with django settings
cloudinary.config(
    cloud_name=settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
    api_key=settings.CLOUDINARY_STORAGE.get('API_KEY'),
    api_secret=settings.CLOUDINARY_STORAGE.get('API_SECRET'),
    secure=True
)

def _is_configured():
    return all([
        settings.CLOUDINARY_STORAGE.get('CLOUD_NAME'),
        settings.CLOUDINARY_STORAGE.get('API_KEY'),
        settings.CLOUDINARY_STORAGE.get('API_SECRET'),
    ])


def upload_image(file_or_path, folder='products'):
    """
    Upload a file (path, bytes, or file-like object) to Cloudinary.
    Returns dict: {url, public_id, width, height, format}
    """
    if not _is_configured():
        raise RuntimeError('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')

    try:
        response = cloudinary.uploader.upload(
            file_or_path,
            folder=folder,
            overwrite=True,
            resource_type='image',
            quality='auto',
            fetch_format='auto',
        )
        return {
            'url': response.get('secure_url'),
            'public_id': response.get('public_id'),
            'width': response.get('width'),
            'height': response.get('height'),
            'format': response.get('format'),
        }
    except Exception as e:
        print(f'Cloudinary upload error: {e}')
        raise e


def upload_from_url(image_url, folder='products'):
    """
    Fetch a remote image by URL and store it in Cloudinary.
    Cloudinary natively accepts remote URLs — no manual downloading required.
    Returns dict: {url, public_id, width, height, format}
    """
    if not _is_configured():
        raise RuntimeError('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')

    try:
        response = cloudinary.uploader.upload(
            image_url,
            folder=folder,
            overwrite=False,
            resource_type='image',
            quality='auto',
            fetch_format='auto',
        )
        return {
            'url': response.get('secure_url'),
            'public_id': response.get('public_id'),
            'width': response.get('width'),
            'height': response.get('height'),
            'format': response.get('format'),
        }
    except Exception as e:
        print(f'Cloudinary URL upload error: {e}')
        raise e


def generate_variants(public_id):
    """
    Return optimised variant URLs for a given Cloudinary public_id:
    - thumbnail (300×300 crop)
    - webp (original dimensions, WebP format)
    - og_image (1200×630, Open Graph)
    """
    if not _is_configured() or not public_id:
        return {}

    base = f'https://res.cloudinary.com/{settings.CLOUDINARY_STORAGE["CLOUD_NAME"]}/image/upload'
    return {
        'thumbnail': f'{base}/c_fill,w_300,h_300,q_auto,f_webp/{public_id}',
        'webp': f'{base}/q_auto,f_webp/{public_id}',
        'avif': f'{base}/q_auto,f_avif/{public_id}',
        'og_image': f'{base}/c_fill,w_1200,h_630,q_auto,f_jpg/{public_id}',
    }


def delete_image(public_id):
    """Delete an image from Cloudinary by public_id."""
    if not public_id or not _is_configured():
        return

    try:
        cloudinary.uploader.destroy(public_id)
    except Exception as e:
        print(f'Cloudinary delete error: {e}')
