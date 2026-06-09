import time
import traceback
from django.utils.timezone import now
from monitoring.models import ApiRequestLog, SystemErrorLog, SecurityLog


class ApiHealthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only monitor /api/ endpoints to avoid bloat
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        start_time = time.time()
        
        # Get response
        response = self.get_response(request)
        
        duration = time.time() - start_time

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR') or '0.0.0.0'

        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        status_code = response.status_code
        success = status_code < 400

        # Log request to DB safely
        try:
            ApiRequestLog.objects.create(
                endpoint=request.path,
                method=request.method,
                status_code=status_code,
                response_time=round(duration, 4),
                success=success,
                ip_address=ip,
                user_agent=user_agent
            )
        except Exception:
            pass # Prevent database writing issues from breaking actual responses

        # Log unauthorized attempts to admin endpoints
        if request.path.startswith('/api/admin/') and status_code in [401, 403]:
            try:
                username = 'Anonymous'
                if request.user and request.user.is_authenticated:
                    username = request.user.username

                SecurityLog.objects.create(
                    event_type='unauthorized_access',
                    ip_address=ip,
                    details=f"Unauthorized access attempt to {request.method} {request.path} by user: {username}",
                    user_agent=user_agent
                )
            except Exception:
                pass

        return response


class SystemExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR') or '0.0.0.0'

        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        username = 'Anonymous'
        if request.user and request.user.is_authenticated:
            username = request.user.username

        # Get stack trace
        trace = traceback.format_exc()

        try:
            SystemErrorLog.objects.create(
                error_type='500',
                message=str(exception),
                stack_trace=trace,
                affected_page=request.path,
                affected_api=request.path if request.path.startswith('/api/') else None,
                affected_user=username
            )
        except Exception:
            pass

        # We return None so Django's default exception handling can continue (and render standard 500 or debug page)
        return None
