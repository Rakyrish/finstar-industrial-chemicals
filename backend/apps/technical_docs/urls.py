from django.urls import path
from .views import TechnicalDocumentListView, TechnicalDocumentDetailView

urlpatterns = [
    path('', TechnicalDocumentListView.as_view(), name='tech-doc-list'),
    path('<slug:slug>/', TechnicalDocumentDetailView.as_view(), name='tech-doc-detail'),
]
