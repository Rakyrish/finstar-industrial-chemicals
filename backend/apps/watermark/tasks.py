"""
Celery tasks driving the watermark bulk-apply job queue.

`poll_watermark_queue` runs on a short Celery Beat interval (see
CELERY_BEAT_SCHEDULE in config/settings/base.py) rather than being dispatched
per-batch, so enqueueing (creating WatermarkJob rows) stays fully decoupled
from processing. Claiming uses SELECT ... FOR UPDATE SKIP LOCKED so that even
if more than one worker process is running, a job is only ever claimed once.
Processing itself is I/O-bound (a Cloudinary existence check), so a small
thread pool is used per poll tick rather than one Celery task per job.
"""
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import WatermarkJob

logger = logging.getLogger(__name__)

POLL_CLAIM_LIMIT = 20
THREAD_POOL_SIZE = 10
RETRY_BACKOFF_SECONDS = {1: 2 * 60, 2: 10 * 60, 3: 30 * 60}
DEFAULT_BACKOFF_SECONDS = 30 * 60


@shared_task
def poll_watermark_queue():
    """Claim a batch of due, pending jobs and process them concurrently."""
    now = timezone.now()
    claimed_ids = []

    with transaction.atomic():
        jobs = list(
            WatermarkJob.objects
            .select_for_update(skip_locked=True)
            .filter(status='pending', next_attempt_at__lte=now)
            .exclude(batch__status__in=['paused', 'cancelled'])
            .order_by('created_at')[:POLL_CLAIM_LIMIT]
        )
        if not jobs:
            return {'claimed': 0}

        for job in jobs:
            job.status = 'processing'
            job.started_at = now
        WatermarkJob.objects.bulk_update(jobs, ['status', 'started_at'])
        claimed_ids = [job.id for job in jobs]

    with ThreadPoolExecutor(max_workers=min(THREAD_POOL_SIZE, len(claimed_ids))) as pool:
        list(pool.map(_process_job, claimed_ids))

    return {'claimed': len(claimed_ids)}


def _process_job(job_id):
    try:
        job = WatermarkJob.objects.select_related('product', 'batch').get(id=job_id)
    except WatermarkJob.DoesNotExist:
        return

    try:
        product = job.product
        if job.action == 'apply':
            _apply_watermark(product)
        else:
            _restore_original(product)

        job.status = 'completed'
        job.finished_at = timezone.now()
        job.save(update_fields=['status', 'finished_at'])
    except Exception as exc:  # noqa: BLE001 — any failure must be recorded on the job row
        _record_failure(job, exc)

    _maybe_complete_batch(job.batch_id)


def _apply_watermark(product):
    if not product.cloudinary_public_id:
        raise ValueError(f'Product {product.id} has no Cloudinary asset to protect')

    # Real I/O — verify the asset genuinely exists on Cloudinary. This can
    # transiently fail (network blip, rate limiting), which is what the
    # retry/backoff logic below exists to absorb.
    from services.cloudinary_service import cloudinary
    cloudinary.api.resource(product.cloudinary_public_id)

    product.is_watermark_applied = True
    product.watermark_applied_at = timezone.now()
    product.save(update_fields=['is_watermark_applied', 'watermark_applied_at'])


def _restore_original(product):
    # Restore is instant and free — no CDN work, just stop serving the
    # transformed URL by flipping the flag back off.
    product.is_watermark_applied = False
    product.last_restored_at = timezone.now()
    product.save(update_fields=['is_watermark_applied', 'last_restored_at'])


def _record_failure(job, exc):
    logger.warning('[watermark] job %s failed (attempt %s): %s', job.id, job.attempts + 1, exc)
    job.attempts += 1
    job.last_error = str(exc)[:2000]

    if job.attempts >= job.max_attempts:
        job.status = 'failed'
        job.finished_at = timezone.now()
        job.save(update_fields=['status', 'attempts', 'last_error', 'finished_at'])
        return

    backoff = RETRY_BACKOFF_SECONDS.get(job.attempts, DEFAULT_BACKOFF_SECONDS)
    job.status = 'pending'
    job.next_attempt_at = timezone.now() + timedelta(seconds=backoff)
    job.save(update_fields=['status', 'attempts', 'last_error', 'next_attempt_at'])


def _maybe_complete_batch(batch_id):
    """Flip a batch to 'completed' once no jobs remain pending/processing."""
    from .models import WatermarkBatch

    still_running = WatermarkJob.objects.filter(
        batch_id=batch_id, status__in=['pending', 'processing']
    ).exists()
    if still_running:
        return
    WatermarkBatch.objects.filter(batch_id=batch_id, status='active').update(
        status='completed', updated_at=timezone.now()
    )
