from django.db import models


class ApiRequestLog(models.Model):
    endpoint = models.CharField(max_length=1000)
    method = models.CharField(max_length=10)
    status_code = models.IntegerField()
    response_time = models.DecimalField(max_digits=8, decimal_places=4) # response time in seconds
    success = models.BooleanField(default=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['endpoint']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.method} {self.endpoint} — {self.status_code} ({self.response_time}s)"


class SystemErrorLog(models.Model):
    ERROR_TYPE_CHOICES = [
        ('404', '404 Page Not Found'),
        ('500', '500 Server Error'),
        ('api', 'API Failure'),
        ('database', 'Database Failure'),
        ('auth', 'Authentication Failure'),
        ('image', 'Image Loading Failure'),
        ('openai', 'OpenAI API Error'),
        ('email', 'Email Delivery Error'),
        ('inventory', 'Inventory Sync Error'),
        ('cloudinary', 'Cloudinary Upload Error'),
    ]

    error_type = models.CharField(max_length=50, choices=ERROR_TYPE_CHOICES, default='500')
    message = models.TextField()
    stack_trace = models.TextField(null=True, blank=True)
    affected_page = models.CharField(max_length=1000, null=True, blank=True)
    affected_api = models.CharField(max_length=1000, null=True, blank=True)
    affected_user = models.CharField(max_length=255, null=True, blank=True)
    resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['error_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.get_error_type_display()} — {self.message[:60]}"


class AiUsageLog(models.Model):
    AGENT_CHOICES = [
        ('chatbot', 'AI Chatbot'),
        ('product_content', 'Product Content Generation'),
        ('seo_assistant', 'SEO Assistant'),
        ('health_assistant', 'Website Health Assistant'),
    ]

    agent = models.CharField(max_length=50, choices=AGENT_CHOICES)
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=6, default=0.000000) # USD cost
    response_time = models.DecimalField(max_digits=8, decimal_places=4) # seconds
    success = models.BooleanField(default=True)
    error_message = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['agent']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.get_agent_display()} — {self.total_tokens} tokens (${self.cost})"


class SecurityLog(models.Model):
    EVENT_CHOICES = [
        ('failed_login', 'Failed Login Attempt'),
        ('admin_login', 'Successful Admin Login'),
        ('suspicious_request', 'Suspicious Request Pattern'),
        ('blocked_ip', 'IP Address Blocked'),
        ('rate_limit', 'Rate Limit Exceeded'),
        ('unauthorized_access', 'Unauthorized Access Attempt'),
    ]

    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    ip_address = models.GenericIPAddressField()
    details = models.TextField()
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.get_event_type_display()} from {self.ip_address} — {self.timestamp:%Y-%m-%d %H:%M}"


class PerformanceMetric(models.Model):
    DEVICE_CHOICES = [
        ('desktop', 'Desktop'),
        ('mobile', 'Mobile'),
        ('tablet', 'Tablet'),
    ]
    METRIC_CHOICES = [
        ('FCP', 'First Contentful Paint'),
        ('LCP', 'Largest Contentful Paint'),
        ('CLS', 'Cumulative Layout Shift'),
        ('INP', 'Interaction to Next Paint'),
        ('TTFB', 'Time to First Byte'),
    ]

    page_url = models.CharField(max_length=1000)
    device = models.CharField(max_length=20, choices=DEVICE_CHOICES, default='desktop')
    metric_name = models.CharField(max_length=20, choices=METRIC_CHOICES)
    value = models.DecimalField(max_digits=10, decimal_places=4) # milliseconds or raw fraction (for CLS)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['metric_name']),
            models.Index(fields=['device']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.metric_name} ({self.device}) on {self.page_url}: {self.value}"


class AuditReport(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    broken_links_count = models.IntegerField(default=0)
    broken_links = models.JSONField(default=list) # [{url, page, status_code}]
    missing_images_count = models.IntegerField(default=0)
    missing_images = models.JSONField(default=list) # [{page, img_src}]
    missing_metadata_count = models.IntegerField(default=0)
    missing_metadata = models.JSONField(default=list) # [{page, field_missing}]
    missing_schema_count = models.IntegerField(default=0)
    missing_schema = models.JSONField(default=list) # [{page}]
    slow_pages_count = models.IntegerField(default=0)
    slow_pages = models.JSONField(default=list) # [{page, response_time}]
    redirect_issues_count = models.IntegerField(default=0)
    redirect_issues = models.JSONField(default=list) # [{page, redirect_url}]
    duplicate_content_count = models.IntegerField(default=0)
    duplicate_content = models.JSONField(default=list) # [{field, duplicate_value, count}]
    indexing_problems_count = models.IntegerField(default=0)
    indexing_problems = models.JSONField(default=list) # [{page, reason}]
    overall_score = models.IntegerField(default=100)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Audit Report #{self.id} — Score: {self.overall_score}% ({self.created_at:%Y-%m-%d})"
