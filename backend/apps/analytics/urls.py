from django.urls import path
from .views import TrackPageViewView, TrackWhatsAppClickView, TrackPhoneClickView, TrackSearchView

urlpatterns = [
    path('pageview/', TrackPageViewView.as_view(), name='analytics-pageview'),
    path('whatsapp-click/', TrackWhatsAppClickView.as_view(), name='analytics-whatsapp'),
    path('phone-click/', TrackPhoneClickView.as_view(), name='analytics-phone'),
    path('search/', TrackSearchView.as_view(), name='analytics-search'),
]
