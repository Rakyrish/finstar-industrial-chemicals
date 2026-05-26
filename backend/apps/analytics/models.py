from django.db import models


class PageView(models.Model):
    page = models.CharField(max_length=1000)
    referrer = models.CharField(max_length=2000, blank=True, null=True)
    device = models.CharField(
        max_length=20,
        choices=[('desktop', 'Desktop'), ('mobile', 'Mobile'), ('tablet', 'Tablet')],
        default='desktop',
    )
    user_agent = models.CharField(max_length=500, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.page} — {self.timestamp:%Y-%m-%d %H:%M}'


class SearchQuery(models.Model):
    query = models.CharField(max_length=500)
    results_count = models.PositiveIntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return self.query


class WhatsAppClick(models.Model):
    source_page = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']


class PhoneClick(models.Model):
    source_page = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
