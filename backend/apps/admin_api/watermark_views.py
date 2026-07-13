from django.db import transaction
from django.db.models import Avg, Count, F
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Category, Product, Tag
from watermark.cloudinary_utils import build_watermark_url
from watermark.models import WatermarkBatch, WatermarkJob, WatermarkSettings

def _settings_payload(obj):
    return {
        'watermarkEnabled': obj.watermark_enabled,
        'rightClickProtectionEnabled': obj.right_click_protection_enabled,
        'dragProtectionEnabled': obj.drag_protection_enabled,
        'longPressProtectionEnabled': obj.long_press_protection_enabled,
        'seoMetadataProtectionEnabled': obj.seo_metadata_protection_enabled,
        'watermarkText': obj.watermark_text,
        'watermarkSecondaryText': obj.watermark_secondary_text,
        'watermarkOpacity': obj.watermark_opacity,
        'watermarkFontSize': obj.watermark_font_size,
        'watermarkAngle': obj.watermark_angle,
        'watermarkPosition': obj.watermark_position,
        'watermarkColor': obj.watermark_color,
        'updatedAt': obj.updated_at,
    }


class AdminWatermarkSettingsView(APIView):
    """GET/PATCH the site-wide watermark & protection singleton."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response(_settings_payload(WatermarkSettings.get_solo()))

    def patch(self, request):
        obj = WatermarkSettings.get_solo()
        data = request.data
        field_map = {
            'watermarkEnabled': 'watermark_enabled',
            'rightClickProtectionEnabled': 'right_click_protection_enabled',
            'dragProtectionEnabled': 'drag_protection_enabled',
            'longPressProtectionEnabled': 'long_press_protection_enabled',
            'seoMetadataProtectionEnabled': 'seo_metadata_protection_enabled',
            'watermarkText': 'watermark_text',
            'watermarkSecondaryText': 'watermark_secondary_text',
            'watermarkOpacity': 'watermark_opacity',
            'watermarkFontSize': 'watermark_font_size',
            'watermarkAngle': 'watermark_angle',
            'watermarkPosition': 'watermark_position',
            'watermarkColor': 'watermark_color',
        }
        for camel_key, field_name in field_map.items():
            if camel_key in data:
                setattr(obj, field_name, data[camel_key])
        try:
            obj.full_clean(exclude=['id'])
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        obj.save()
        return Response(_settings_payload(obj))


class AdminWatermarkPreviewView(APIView):
    """
    POST — render a sample transformed image URL using given (not-yet-saved)
    design overrides, without touching the DB. Never runs against every
    product — just one sample asset.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        data = request.data
        product_id = data.get('productId')
        if product_id:
            product = Product.objects.filter(pk=product_id).exclude(cloudinary_public_id='').first()
        else:
            product = Product.objects.exclude(cloudinary_public_id__isnull=True).exclude(cloudinary_public_id='').first()

        if not product or not product.cloudinary_public_id:
            return Response(
                {'detail': 'No product with a Cloudinary image is available to preview against.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        preview_settings = WatermarkSettings.get_solo()
        overrides = {
            'watermark_text': data.get('watermarkText', preview_settings.watermark_text),
            'watermark_secondary_text': data.get('watermarkSecondaryText', preview_settings.watermark_secondary_text),
            'watermark_opacity': int(data.get('watermarkOpacity', preview_settings.watermark_opacity)),
            'watermark_font_size': int(data.get('watermarkFontSize', preview_settings.watermark_font_size)),
            'watermark_angle': int(data.get('watermarkAngle', preview_settings.watermark_angle)),
            'watermark_position': data.get('watermarkPosition', preview_settings.watermark_position),
            'watermark_color': data.get('watermarkColor', preview_settings.watermark_color),
        }

        class _PreviewSettings:
            pass

        preview = _PreviewSettings()
        for key, value in overrides.items():
            setattr(preview, key, value)

        url = build_watermark_url(product.cloudinary_public_id, preview)
        return Response({'url': url, 'productId': product.id, 'productName': product.name})


class AdminWatermarkScopesView(APIView):
    """
    GET — categories/tags that actually have products attached, so the
    bulk-apply scope dropdown never offers empty placeholder taxonomy.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        categories = (
            Category.objects.annotate(product_count=Count('products'))
            .filter(product_count__gt=0)
            .order_by('name')
        )
        tags = (
            Tag.objects.annotate(product_count=Count('products'))
            .filter(product_count__gt=0)
            .order_by('name')
        )
        never_protected_count = Product.objects.filter(is_watermark_applied=False).count()
        active_count = Product.objects.filter(status='active').count()
        return Response({
            'categories': [
                {'id': c.id, 'name': c.name, 'slug': c.slug, 'productCount': c.product_count}
                for c in categories
            ],
            'tags': [
                {'id': t.id, 'name': t.name, 'slug': t.slug, 'productCount': t.product_count}
                for t in tags
            ],
            'allActiveCount': active_count,
            'neverProtectedCount': never_protected_count,
        })


def _resolve_scope_queryset(scope_type, scope_value, action):
    qs = Product.objects.all()
    if scope_type == 'all':
        qs = qs.filter(status='active')
    elif scope_type == 'category':
        qs = qs.filter(category_id=scope_value)
    elif scope_type == 'tag':
        qs = qs.filter(tags__id=scope_value)
    elif scope_type == 'never_protected':
        qs = qs.filter(is_watermark_applied=False)
    else:
        raise ValueError(f'Unknown scope_type "{scope_type}"')

    if action == 'apply':
        qs = qs.exclude(cloudinary_public_id__isnull=True).exclude(cloudinary_public_id='').exclude(is_watermark_applied=True)
    else:  # restore
        qs = qs.filter(is_watermark_applied=True)

    return qs.distinct()


def _enqueue_batch(scope_type, scope_value, action, user):
    """
    Shared by the bulk-apply and restore-all endpoints. Returns a response
    payload dict. Creates zero DB rows (no batch_id at all) if nothing ends
    up eligible, so the frontend never starts polling a batch that will
    never resolve.
    """
    qs = _resolve_scope_queryset(scope_type, scope_value, action)
    matched = list(qs)
    total_matched = len(matched)

    busy_product_ids = set(
        WatermarkJob.objects.filter(action=action, status__in=['pending', 'processing'])
        .values_list('product_id', flat=True)
    )
    eligible = [p for p in matched if p.id not in busy_product_ids]
    skipped_count = total_matched - len(eligible)

    if not eligible:
        return {
            'batchId': None,
            'queuedCount': 0,
            'skippedCount': skipped_count,
            'totalMatched': total_matched,
            'detail': 'No items were eligible for this scope.',
        }

    with transaction.atomic():
        batch = WatermarkBatch.objects.create(
            scope_type=scope_type,
            scope_value=str(scope_value or ''),
            action=action,
            total_matched=total_matched,
            queued_count=len(eligible),
            skipped_count=skipped_count,
            created_by=user if user.is_authenticated else None,
        )
        WatermarkJob.objects.bulk_create([
            WatermarkJob(batch=batch, product=p, action=action) for p in eligible
        ])

    return {
        'batchId': str(batch.batch_id),
        'queuedCount': len(eligible),
        'skippedCount': skipped_count,
        'totalMatched': total_matched,
    }


class AdminWatermarkBulkApplyView(APIView):
    """
    POST — enqueue one WatermarkJob per matching, not-already-queued product.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        data = request.data
        scope_type = data.get('scopeType')
        scope_value = data.get('scopeValue', '')
        action = data.get('action', 'apply')

        if action not in ('apply', 'restore'):
            return Response({'detail': 'action must be "apply" or "restore".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = _enqueue_batch(scope_type, scope_value, action, request.user)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(payload, status=status.HTTP_201_CREATED if payload.get('batchId') else status.HTTP_200_OK)


class AdminWatermarkRestoreAllView(APIView):
    """POST — convenience wrapper: bulk-apply with scope=all, action=restore."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        payload = _enqueue_batch('all', '', 'restore', request.user)
        return Response(payload, status=status.HTTP_201_CREATED if payload.get('batchId') else status.HTTP_200_OK)


class AdminWatermarkBatchListView(APIView):
    """GET — history of past/current batches, most recent first."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        batches = WatermarkBatch.objects.all()[:100]
        return Response({
            'results': [
                {
                    'batchId': str(b.batch_id),
                    'scopeType': b.scope_type,
                    'scopeValue': b.scope_value,
                    'action': b.action,
                    'status': b.status,
                    'totalMatched': b.total_matched,
                    'queuedCount': b.queued_count,
                    'skippedCount': b.skipped_count,
                    'createdAt': b.created_at,
                    'updatedAt': b.updated_at,
                }
                for b in batches
            ],
        })


def _batch_status_payload(batch):
    counts = {row['status']: row['n'] for row in batch.jobs.values('status').annotate(n=Count('id'))}
    pending = counts.get('pending', 0)
    processing = counts.get('processing', 0)
    completed = counts.get('completed', 0)
    failed = counts.get('failed', 0)
    cancelled = counts.get('cancelled', 0)
    total = pending + processing + completed + failed + cancelled
    done = completed + failed + cancelled
    percent_complete = round((done / total) * 100, 1) if total else 100.0

    avg_seconds = batch.jobs.filter(status='completed', started_at__isnull=False, finished_at__isnull=False).aggregate(
        avg=Avg(F('finished_at') - F('started_at'))
    )['avg']
    remaining = pending + processing
    if avg_seconds and remaining:
        eta_seconds = int(avg_seconds.total_seconds() * remaining)
    elif remaining:
        eta_seconds = remaining * 3  # heuristic fallback, ~3s/job
    else:
        eta_seconds = 0

    recent = batch.jobs.select_related('product').order_by('-created_at')[:10]

    return {
        'batchId': str(batch.batch_id),
        'status': batch.status,
        'scopeType': batch.scope_type,
        'scopeValue': batch.scope_value,
        'action': batch.action,
        'counts': {
            'pending': pending, 'processing': processing, 'completed': completed,
            'failed': failed, 'cancelled': cancelled, 'total': total,
        },
        'percentComplete': percent_complete,
        'etaSeconds': eta_seconds,
        'recentResults': [
            {
                'productId': j.product_id,
                'productName': j.product.name,
                'status': j.status,
                'attempts': j.attempts,
                'lastError': j.last_error,
                'finishedAt': j.finished_at,
            }
            for j in recent
        ],
    }


class AdminWatermarkBatchStatusView(APIView):
    """GET — aggregate progress for one batch. 404s if the batch doesn't exist."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, batch_id):
        try:
            batch = WatermarkBatch.objects.get(pk=batch_id)
        except WatermarkBatch.DoesNotExist:
            return Response({'detail': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_batch_status_payload(batch))


class AdminWatermarkBatchPauseView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, batch_id):
        updated = WatermarkBatch.objects.filter(pk=batch_id, status='active').update(
            status='paused', updated_at=timezone.now()
        )
        if not updated:
            return Response({'detail': 'Batch not found or not active.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'Batch paused.'})


class AdminWatermarkBatchResumeView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, batch_id):
        updated = WatermarkBatch.objects.filter(pk=batch_id, status='paused').update(
            status='active', updated_at=timezone.now()
        )
        if not updated:
            return Response({'detail': 'Batch not found or not paused.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'detail': 'Batch resumed.'})


class AdminWatermarkBatchCancelView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, batch_id):
        try:
            batch = WatermarkBatch.objects.get(pk=batch_id)
        except WatermarkBatch.DoesNotExist:
            return Response({'detail': 'Batch not found.'}, status=status.HTTP_404_NOT_FOUND)
        with transaction.atomic():
            batch.jobs.filter(status__in=['pending', 'processing']).update(status='cancelled', finished_at=timezone.now())
            batch.status = 'cancelled'
            batch.save(update_fields=['status', 'updated_at'])
        return Response({'detail': 'Batch cancelled.'})


class AdminWatermarkProductApplyView(APIView):
    """
    POST — instant per-item apply. No queue needed: this is a single-row
    flag flip, not CDN reprocessing.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not product.cloudinary_public_id:
            return Response(
                {'detail': 'Product has no Cloudinary image to protect.'}, status=status.HTTP_400_BAD_REQUEST
            )
        product.is_watermark_applied = True
        product.watermark_applied_at = timezone.now()
        product.save(update_fields=['is_watermark_applied', 'watermark_applied_at'])
        return Response({'detail': f'Watermark protection applied to "{product.name}".', 'isWatermarkApplied': True})


class AdminWatermarkProductRestoreView(APIView):
    """POST — instant per-item restore. Original asset was never touched."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_watermark_applied = False
        product.last_restored_at = timezone.now()
        product.save(update_fields=['is_watermark_applied', 'last_restored_at'])
        return Response({'detail': f'"{product.name}" restored to its original image.', 'isWatermarkApplied': False})
