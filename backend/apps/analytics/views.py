from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PageView, SearchQuery, WhatsAppClick, PhoneClick


class TrackPageViewSerializer(serializers.Serializer):
    page = serializers.CharField(max_length=1000)
    referrer = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    device = serializers.ChoiceField(choices=['desktop', 'mobile', 'tablet'], default='desktop')


class TrackClickSerializer(serializers.Serializer):
    source_page = serializers.CharField(max_length=1000)


class TrackSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=500)
    results_count = serializers.IntegerField(default=0)


class TrackPageViewView(APIView):
    permission_classes = []

    def post(self, request):
        s = TrackPageViewSerializer(data=request.data)
        if s.is_valid():
            PageView.objects.create(
                page=s.validated_data['page'],
                referrer=s.validated_data.get('referrer', ''),
                device=s.validated_data.get('device', 'desktop'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                ip_address=request.META.get('REMOTE_ADDR'),
            )
        return Response({'tracked': True}, status=status.HTTP_201_CREATED)


class TrackWhatsAppClickView(APIView):
    permission_classes = []

    def post(self, request):
        s = TrackClickSerializer(data=request.data)
        if s.is_valid():
            WhatsAppClick.objects.create(source_page=s.validated_data['source_page'])
        return Response({'tracked': True}, status=status.HTTP_201_CREATED)


class TrackPhoneClickView(APIView):
    permission_classes = []

    def post(self, request):
        s = TrackClickSerializer(data=request.data)
        if s.is_valid():
            PhoneClick.objects.create(source_page=s.validated_data['source_page'])
        return Response({'tracked': True}, status=status.HTTP_201_CREATED)


class TrackSearchView(APIView):
    permission_classes = []

    def post(self, request):
        s = TrackSearchSerializer(data=request.data)
        if s.is_valid():
            SearchQuery.objects.create(
                query=s.validated_data['query'],
                results_count=s.validated_data.get('results_count', 0),
            )
        return Response({'tracked': True}, status=status.HTTP_201_CREATED)
