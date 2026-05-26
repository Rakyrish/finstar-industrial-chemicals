import os
from django.core.management.base import BaseCommand
from django.conf import settings
from products.models import Product
from services.cloudinary_service import upload_image


class Command(BaseCommand):
    help = 'Migrates existing local product media images to Cloudinary enterprise storage.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Preview what would be migrated without making any changes.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN mode — no files will be uploaded or saved.'))

        self.stdout.write('Checking active product catalog for local media assets...')
        products = Product.objects.filter(primary_image__isnull=False).exclude(primary_image='')

        migrated_count = 0
        skipped_count = 0

        for product in products:
            image_field = product.primary_image
            try:
                url = image_field.url
            except Exception:
                skipped_count += 1
                continue

            # If it's already a Cloudinary URL, skip it
            if 'cloudinary.com' in url or (url.startswith('http') and not url.startswith(settings.MEDIA_URL)):
                skipped_count += 1
                self.stdout.write(self.style.WARNING(
                    f"Skipping '{product.name}' — already hosted remotely: {url}"
                ))
                continue

            try:
                local_path = image_field.path
            except Exception:
                skipped_count += 1
                self.stdout.write(self.style.ERROR(
                    f"Skipping '{product.name}' — cannot resolve local path."
                ))
                continue

            if not os.path.exists(local_path):
                skipped_count += 1
                self.stdout.write(self.style.ERROR(
                    f"Skipping '{product.name}' — local file not found: {local_path}"
                ))
                continue

            self.stdout.write(f"{'[DRY RUN] Would upload' if dry_run else 'Uploading'} '{product.name}' image to Cloudinary...")

            if dry_run:
                migrated_count += 1
                continue

            try:
                # Upload and get Cloudinary response with secure_url + public_id
                res = upload_image(local_path, folder='products')

                secure_url = res.get('secure_url', '')
                public_id = res.get('public_id', '')

                # Re-save the file through Django-Cloudinary-Storage
                with open(local_path, 'rb') as f:
                    product.primary_image.save(os.path.basename(local_path), f, save=False)

                # Also update the dedicated cloudinary_url and cloudinary_public_id columns
                if secure_url:
                    product.cloudinary_url = secure_url
                if public_id:
                    product.cloudinary_public_id = public_id

                product.save(update_fields=['primary_image', 'cloudinary_url', 'cloudinary_public_id'])

                migrated_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f"✓ Migrated '{product.name}' → {secure_url}"
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"✗ Failed to migrate '{product.name}': {str(e)}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"\nMigration {'preview' if dry_run else 'run'} completed. "
            f"Migrated: {migrated_count}, Skipped: {skipped_count}."
        ))
