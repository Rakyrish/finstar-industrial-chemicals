import csv
import json
import time
import urllib.parse
from datetime import datetime, timedelta
from decimal import Decimal
from html.parser import HTMLParser
import requests
from django.conf import settings
from django.db.models import Avg, Count, Sum, Q, Min, Max
from django.http import StreamingHttpResponse, HttpResponse
from django.utils import timezone
from django.utils.timezone import now
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

# Import local models
from monitoring.models import (
    ApiRequestLog, SystemErrorLog, AiUsageLog,
    SecurityLog, PerformanceMetric, AuditReport
)
from analytics.models import PageView, SearchQuery, WhatsAppClick, PhoneClick
from crm.models import Lead
from inquiries.models import QuoteRequest, ContactMessage
from chatbot.models import ChatSession, ChatMessage
from inventory.models import StockItem
from products.models import Product, Category
from seo.models import SeoPage
from blog.models import BlogPost


def parse_date_param(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except (TypeError, ValueError):
        return None


# Helper function to group page views into sessions
def group_pageviews_into_sessions(pvs_list):
    sessions = {}
    for pv in pvs_list:
        key = (pv.ip_address or '0.0.0.0', pv.user_agent or 'unknown')
        if key not in sessions:
            sessions[key] = [[pv]]
        else:
            last_pv = sessions[key][-1][-1]
            diff = (pv.timestamp - last_pv.timestamp).total_seconds()
            if diff <= 1800: # 30 min window
                sessions[key][-1].append(pv)
            else:
                sessions[key].append([pv])
    
    flat = []
    for key, lists in sessions.items():
        for s in lists:
            flat.append(s)
    return flat


class MonitoringOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        cutoff = now() - timedelta(days=days)
        
        # 1. Traffic metrics
        all_pvs = PageView.objects.filter(timestamp__gte=cutoff).order_by('timestamp')
        pvs_list = list(all_pvs)
        sessions = group_pageviews_into_sessions(pvs_list)
        
        total_pvs = len(pvs_list)
        total_sessions = len(sessions)
        
        # Active users right now (last 5 min)
        active_cutoff = now() - timedelta(minutes=5)
        active_users = PageView.objects.filter(timestamp__gte=active_cutoff).values('ip_address', 'user_agent').distinct().count()
        
        # Visitors Today, Week, Month
        today_start = now().replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = now() - timedelta(days=7)
        
        visitors_today = PageView.objects.filter(timestamp__gte=today_start).values('ip_address', 'user_agent').distinct().count()
        visitors_week = PageView.objects.filter(timestamp__gte=week_start).values('ip_address', 'user_agent').distinct().count()
        visitors_month = PageView.objects.filter(timestamp__gte=cutoff).values('ip_address', 'user_agent').distinct().count()
        
        # New vs Returning Visitors
        # Visitor count of those who visited prior to cutoff vs first time after cutoff
        all_visitors = PageView.objects.values('ip_address', 'user_agent').annotate(first_visit=Min('timestamp'))
        new_visitors = 0
        returning_visitors = 0
        for visitor in all_visitors:
            if visitor['first_visit'] >= cutoff:
                new_visitors += 1
            else:
                returning_visitors += 1
        
        # Bounce Rate & Session Duration
        total_duration = 0
        bounces = 0
        for sess in sessions:
            if len(sess) <= 1:
                bounces += 1
            duration = (sess[-1].timestamp - sess[0].timestamp).total_seconds()
            total_duration += duration
            
        bounce_rate = (bounces / total_sessions * 100) if total_sessions > 0 else 0.0
        avg_session_duration = (total_duration / total_sessions) if total_sessions > 0 else 0.0
        
        # 2. Page Analysis
        page_counts = {}
        landing_counts = {}
        exit_counts = {}
        
        for sess in sessions:
            # Landing
            l_page = sess[0].page
            landing_counts[l_page] = landing_counts.get(l_page, 0) + 1
            # Exit
            e_page = sess[-1].page
            exit_counts[e_page] = exit_counts.get(e_page, 0) + 1
            # Views
            for pv in sess:
                page_counts[pv.page] = page_counts.get(pv.page, 0) + 1
                
        top_landing = sorted([{'page': k, 'count': v} for k, v in landing_counts.items()], key=lambda x: x['count'], reverse=True)[:5]
        top_exit = sorted([{'page': k, 'count': v} for k, v in exit_counts.items()], key=lambda x: x['count'], reverse=True)[:5]
        top_viewed = sorted([{'page': k, 'count': v} for k, v in page_counts.items()], key=lambda x: x['count'], reverse=True)[:10]
        
        # 3. User Flow Transitions
        transitions = {}
        for sess in sessions:
            for i in range(len(sess) - 1):
                src = sess[i].page
                tgt = sess[i+1].page
                if src != tgt: # count page changes
                    pair = (src, tgt)
                    transitions[pair] = transitions.get(pair, 0) + 1
                    
        flow = sorted([
            {'source': k[0], 'target': k[1], 'value': v} for k, v in transitions.items()
        ], key=lambda x: x['value'], reverse=True)[:10]
        
        # 4. Traffic Chart Data (grouped by date)
        chart_data = {}
        for pv in pvs_list:
            date_str = pv.timestamp.strftime('%Y-%m-%d')
            chart_data[date_str] = chart_data.get(date_str, 0) + 1
            
        visitors_chart = [{'date': k, 'count': v} for k, v in sorted(chart_data.items())]
        
        return Response({
            'overview': {
                'totalVisitors': visitors_month,
                'activeUsers': active_users,
                'visitorsToday': visitors_today,
                'visitorsThisWeek': visitors_week,
                'visitorsThisMonth': visitors_month,
                'returningVisitors': returning_visitors,
                'newVisitors': new_visitors,
                'avgSessionDuration': round(avg_session_duration, 1),
                'bounceRate': round(bounce_rate, 1),
            },
            'topLandingPages': top_landing,
            'topExitPages': top_exit,
            'mostViewedPages': top_viewed,
            'userFlow': flow,
            'visitorsChart': visitors_chart
        })


class SeoAuditView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        products = Product.objects.all()
        categories = Category.objects.all()
        blogs = BlogPost.objects.all()
        seo_pages = SeoPage.objects.all()
        
        prod_count = products.count()
        cat_count = categories.count()
        blog_count = blogs.count()
        page_count = seo_pages.count()
        
        # Calculate Product SEO
        prod_meta_titles = 0
        prod_meta_descs = 0
        prod_schema = 0
        prod_alts = 0
        
        prod_issues = []
        for p in products:
            issues = []
            if p.seo_title: prod_meta_titles += 1
            else: issues.append("Missing SEO Title")
            if p.seo_description: prod_meta_descs += 1
            else: issues.append("Missing SEO Description")
            if p.schema_markup: prod_schema += 1
            else: issues.append("Missing JSON-LD Schema")
            if p.image_alt: prod_alts += 1
            else: issues.append("Missing Image Alt Text")
            
            if issues:
                prod_issues.append({'name': p.name, 'slug': p.slug, 'issues': issues, 'type': 'product'})

        # Calculate Category SEO
        cat_meta_titles = 0
        cat_meta_descs = 0
        cat_issues = []
        for c in categories:
            issues = []
            if c.seo_title: cat_meta_titles += 1
            else: issues.append("Missing SEO Title")
            if c.seo_description: cat_meta_descs += 1
            else: issues.append("Missing SEO Description")
            if issues:
                cat_issues.append({'name': c.name, 'slug': c.slug, 'issues': issues, 'type': 'category'})

        # Calculate Blog SEO
        blog_meta_titles = 0
        blog_meta_descs = 0
        blog_issues = []
        for b in blogs:
            issues = []
            if b.seo_title: blog_meta_titles += 1
            else: issues.append("Missing SEO Title")
            if b.seo_description: blog_meta_descs += 1
            else: issues.append("Missing SEO Description")
            if issues:
                blog_issues.append({'name': b.title, 'slug': b.slug, 'issues': issues, 'type': 'blog'})

        # Score computations (weight average)
        prod_score = (
            ((prod_meta_titles + prod_meta_descs + prod_schema + prod_alts) / (4 * prod_count * 1.0) * 100)
            if prod_count > 0 else None
        )
        cat_score = (
            ((cat_meta_titles + cat_meta_descs) / (2 * cat_count * 1.0) * 100)
            if cat_count > 0 else None
        )
        blog_score = (
            ((blog_meta_titles + blog_meta_descs) / (2 * blog_count * 1.0) * 100)
            if blog_count > 0 else None
        )
        
        # General checks. Only report health when a real configured site URL can be checked.
        robots_health = None
        sitemap_health = None
        site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
        if site_url:
            try:
                robots_res = requests.get(urllib.parse.urljoin(site_url, '/robots.txt'), timeout=3.0)
                robots_health = 'Healthy' if robots_res.status_code == 200 else 'Unavailable'
            except requests.RequestException:
                robots_health = 'Unavailable'

            try:
                sitemap_res = requests.get(urllib.parse.urljoin(site_url, '/sitemap.xml'), timeout=3.0)
                sitemap_health = 'Healthy' if sitemap_res.status_code == 200 else 'Unavailable'
            except requests.RequestException:
                sitemap_health = 'Unavailable'
        
        # Overall SEO score
        all_checks = (prod_count * 4) + (cat_count * 2) + (blog_count * 2)
        passed_checks = (
            (prod_meta_titles + prod_meta_descs + prod_schema + prod_alts) +
            (cat_meta_titles + cat_meta_descs) +
            (blog_meta_titles + blog_meta_descs)
        )
        overall_score = (passed_checks / (all_checks * 1.0) * 100) if all_checks > 0 else None

        all_issues = prod_issues + cat_issues + blog_issues
        fmt_score = lambda score: round(score, 1) if score is not None else None
        
        return Response({
            'scores': {
                'overall': fmt_score(overall_score),
                'products': fmt_score(prod_score),
                'categories': fmt_score(cat_score),
                'blogs': fmt_score(blog_score),
            },
            'sourceCounts': {
                'products': prod_count,
                'categories': cat_count,
                'blogs': blog_count,
                'pages': page_count,
            },
            'indexing': {
                'robotsTxt': robots_health,
                'sitemapCoverage': sitemap_health,
            },
            'issues': all_issues[:30] # return top 30 issues
        })


class PerformanceView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        cutoff = now() - timedelta(days=days)
        
        # Calculate averages per device
        vitals = PerformanceMetric.objects.filter(timestamp__gte=cutoff)
        
        def get_avg(metric, device):
            val = vitals.filter(metric_name=metric, device=device).aggregate(Avg('value'))['value__avg']
            return round(float(val), 2) if val is not None else None

        metrics = ['FCP', 'LCP', 'CLS', 'INP', 'TTFB']
        devices = ['desktop', 'mobile']
        
        results = {}
        for dev in devices:
            results[dev] = {}
            for m in metrics:
                results[dev][m] = get_avg(m, dev)
                
        # Calculate scores out of 100 based on standard metrics weight
        # Standard Lighthouse weights: LCP (25%), FCP (10%), CLS (25%), INP (30%), TTFB (10%)
        # Let's write simple scoring thresholds:
        # FCP: <1.8s (1800ms) = 100, >3.0s (3000ms) = 49
        # LCP: <2.5s (2500ms) = 100, >4.0s (4000ms) = 49
        # CLS: <0.1 = 100, >0.25 = 49
        # INP: <200ms = 100, >500ms = 49
        # TTFB: <800ms = 100, >1800ms = 49
        scores = {}
        for dev in devices:
            score_sum = 0
            count = 0
            
            # FCP (weight 0.10)
            fcp = results[dev]['FCP']
            if fcp:
                s = 100 if fcp <= 1800 else (0 if fcp >= 4000 else 100 - ((fcp - 1800) / 22))
                score_sum += s * 0.10
                count += 0.10
            # LCP (weight 0.25)
            lcp = results[dev]['LCP']
            if lcp:
                s = 100 if lcp <= 2500 else (0 if lcp >= 5000 else 100 - ((lcp - 2500) / 25))
                score_sum += s * 0.25
                count += 0.25
            # CLS (weight 0.25)
            cls_val = results[dev]['CLS']
            if cls_val is not None:
                s = 100 if cls_val <= 0.1 else (0 if cls_val >= 0.5 else 100 - ((cls_val - 0.1) * 200))
                score_sum += s * 0.25
                count += 0.25
            # INP (weight 0.30)
            inp = results[dev]['INP']
            if inp:
                s = 100 if inp <= 200 else (0 if inp >= 600 else 100 - ((inp - 200) / 4))
                score_sum += s * 0.30
                count += 0.30
            # TTFB (weight 0.10)
            ttfb = results[dev]['TTFB']
            if ttfb:
                s = 100 if ttfb <= 500 else (0 if ttfb >= 2000 else 100 - ((ttfb - 500) / 15))
                score_sum += s * 0.10
                count += 0.10
                
            scores[dev] = round(score_sum / count) if count > 0 else None

        # Historical trend (last 7 days average LCP)
        trend = []
        for i in range(6, -1, -1):
            d = now() - timedelta(days=i)
            d_str = d.strftime('%Y-%m-%d')
            avg_lcp = PerformanceMetric.objects.filter(
                timestamp__date=d.date(), metric_name='LCP'
            ).aggregate(Avg('value'))['value__avg']
            trend.append({
                'date': d_str,
                'lcp': round(float(avg_lcp), 0) if avg_lcp else None
            })

        return Response({
            'vitals': results,
            'scores': scores,
            'trend': trend
        })


class PublicVitalsView(APIView):
    permission_classes = [] # Allow public users submitting metrics

    def post(self, request):
        d = request.data
        page_url = d.get('page_url') or d.get('pageUrl')
        device = d.get('device', 'desktop')
        metric_name = d.get('metric_name') or d.get('metricName')
        value = d.get('value')
        
        if not all([page_url, metric_name, value is not None]):
            return Response({'error': 'Missing vital parameters'}, status=status.HTTP_400_BAD_REQUEST)
        if device not in dict(PerformanceMetric.DEVICE_CHOICES):
            device = 'desktop'
        if metric_name not in dict(PerformanceMetric.METRIC_CHOICES):
            return Response({'tracked': False, 'ignored': True}, status=status.HTTP_202_ACCEPTED)
            
        try:
            val_decimal = Decimal(str(value))
            PerformanceMetric.objects.create(
                page_url=page_url[:1000],
                device=device,
                metric_name=metric_name[:20],
                value=val_decimal
            )
            return Response({'tracked': True}, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class ErrorLogView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        error_type = request.query_params.get('type')
        resolved = request.query_params.get('resolved')
        search = request.query_params.get('search')
        start_date = parse_date_param(request.query_params.get('start'))
        end_date = parse_date_param(request.query_params.get('end'))
        
        q = Q()
        if error_type:
            q &= Q(error_type=error_type)
        if resolved is not None:
            resolved_bool = resolved.lower() == 'true'
            q &= Q(resolved=resolved_bool)
        if search:
            q &= Q(message__icontains=search) | Q(affected_page__icontains=search) | Q(affected_api__icontains=search)
        if start_date:
            q &= Q(timestamp__date__gte=start_date)
        if end_date:
            q &= Q(timestamp__date__lte=end_date)
            
        errors = SystemErrorLog.objects.filter(q)[:100]
        
        # Calculate error frequency / stats
        stats = SystemErrorLog.objects.filter(q).values('error_type').annotate(count=Count('id')).order_by('-count')
        
        data = []
        for e in errors:
            data.append({
                'id': e.id,
                'errorType': e.error_type,
                'errorTypeDisplay': e.get_error_type_display(),
                'message': e.message,
                'stackTrace': e.stack_trace,
                'affectedPage': e.affected_page,
                'affectedApi': e.affected_api,
                'affectedUser': e.affected_user,
                'resolved': e.resolved,
                'resolutionNotes': e.resolution_notes,
                'timestamp': e.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
            
        return Response({
            'errors': data,
            'stats': list(stats)
        })

    def patch(self, request, pk):
        # Resolve error log view
        try:
            error = SystemErrorLog.objects.get(pk=pk)
        except SystemErrorLog.DoesNotExist:
            return Response({'detail': 'Error log not found'}, status=status.HTTP_404_NOT_FOUND)
            
        notes = request.data.get('notes', '')
        resolved = request.data.get('resolved', True)
        
        error.resolved = resolved
        error.resolution_notes = notes
        error.save()
        
        return Response({
            'success': True,
            'resolved': error.resolved,
            'notes': error.resolution_notes
        })


class ApiHealthView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # We categorize APIs by path
        categories = {
            'Products': '/api/v1/products',
            'Categories': '/api/v1/products?category',
            'Inventory': '/api/v1/inventory',
            'Analytics': '/api/v1/analytics',
            'Chatbot': '/api/v1/chatbot',
            'Quotes & Inquiries': '/api/v1/inquiries',
            'Authentication': '/api/v1/auth',
        }
        
        health_data = []
        for name, prefix in categories.items():
            logs = ApiRequestLog.objects.filter(endpoint__startswith=prefix)
            total = logs.count()
            
            if total == 0:
                health_data.append({
                    'name': name,
                    'status': 'No Data',
                    'successRate': None,
                    'avgResponseTime': None,
                    'failureRate': None,
                    'lastSuccess': None,
                    'lastFailure': None,
                    'uptime': None,
                    'requests': 0
                })
                continue
                
            success_count = logs.filter(success=True).count()
            failure_count = total - success_count
            avg_time = logs.aggregate(Avg('response_time'))['response_time__avg']
            
            success_rate = (success_count / total) * 100
            failure_rate = (failure_count / total) * 100
            
            last_success_log = logs.filter(success=True).first()
            last_failure_log = logs.filter(success=False).first()
            
            last_success = last_success_log.timestamp.strftime('%Y-%m-%d %H:%M:%S') if last_success_log else None
            last_failure = last_failure_log.timestamp.strftime('%Y-%m-%d %H:%M:%S') if last_failure_log else None
            
            # Status determination
            # Online: success_rate >= 95 and avg_time < 1.5s
            # Degraded: success_rate between 80 and 95 or avg_time >= 1.5s
            # Offline: success_rate < 80 or (last 3 calls failed)
            status_label = 'Online'
            if success_rate < 80:
                status_label = 'Offline'
            elif success_rate < 95 or (avg_time and avg_time > 1.5):
                status_label = 'Degraded'
                
            # Check last 3 requests
            recent = list(logs.order_by('-timestamp')[:3])
            if len(recent) >= 3 and all(not r.success for r in recent):
                status_label = 'Offline'
                
            health_data.append({
                'name': name,
                'status': status_label,
                'successRate': round(success_rate, 1),
                'avgResponseTime': round(float(avg_time), 3) if avg_time else 0.0,
                'failureRate': round(failure_rate, 1),
                'lastSuccess': last_success,
                'lastFailure': last_failure,
                'uptime': round(success_rate, 1), # simple uptime correlation
                'requests': total
            })
            
        return Response(health_data)


class AiUsageView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        cutoff_today = now() - timedelta(hours=24)
        
        agents = {
            'chatbot': 'AI Chatbot',
            'product_content': 'Product Content Generation',
            'seo_assistant': 'SEO Assistant',
            'health_assistant': 'Website Health Assistant'
        }
        
        agent_data = []
        for key, name in agents.items():
            logs = AiUsageLog.objects.filter(agent=key)
            total = logs.count()
            
            if total == 0:
                agent_data.append({
                    'agent': key,
                    'name': name,
                    'requests': 0,
                    'requestsToday': 0,
                    'tokens': None,
                    'cost': None,
                    'avgResponseTime': None,
                    'failedRequests': 0
                })
                continue
                
            today_count = logs.filter(timestamp__gte=cutoff_today).count()
            total_tokens = logs.aggregate(Sum('total_tokens'))['total_tokens__sum'] or 0
            total_cost = logs.aggregate(Sum('cost'))['cost__sum'] or 0.00
            avg_time = logs.aggregate(Avg('response_time'))['response_time__avg'] or 0.00
            failed_count = logs.filter(success=False).count()
            
            agent_data.append({
                'agent': key,
                'name': name,
                'requests': total,
                'requestsToday': today_count,
                'tokens': total_tokens,
                'cost': round(float(total_cost), 4),
                'avgResponseTime': round(float(avg_time), 2),
                'failedRequests': failed_count
            })
            
        # Chatbot analytics details
        sessions_count = ChatSession.objects.count()
        csat_avg = ChatSession.objects.exclude(rating__isnull=True).aggregate(Avg('rating'))['rating__avg']
        escalated_count = ChatSession.objects.filter(escalated=True).count()
        failed_chat_count = ChatSession.objects.aggregate(Sum('failed_response_count'))['failed_response_count__sum'] or 0
        
        # Most asked questions (naive grouping of user messages)
        # Fetch first message content of recent 100 sessions
        questions = []
        sessions_with_msgs = ChatSession.objects.prefetch_related('messages').order_by('-created_at')[:100]
        for s in sessions_with_msgs:
            first_msg = s.messages.filter(role='user').first()
            if first_msg:
                questions.append(first_msg.content.strip())
                
        # Group similar queries (simple frequency check)
        from collections import Counter
        grouped_questions = Counter(questions).most_common(5)
        top_questions = [{'question': q, 'count': c} for q, c in grouped_questions]

        return Response({
            'agents': agent_data,
            'chatbotStats': {
                'sessionsCount': sessions_count,
                'csatAverage': round(float(csat_avg), 1) if csat_avg else None,
                'escalatedCount': escalated_count,
                'failedResponsesCount': failed_chat_count,
            },
            'topQuestions': top_questions
        })


class SecurityLogView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        start_date = parse_date_param(request.query_params.get('start'))
        end_date = parse_date_param(request.query_params.get('end'))
        q = Q()
        if start_date:
            q &= Q(timestamp__date__gte=start_date)
        if end_date:
            q &= Q(timestamp__date__lte=end_date)

        log_qs = SecurityLog.objects.filter(q)
        logs = log_qs[:100]
        
        counts = {
            'failed_login': log_qs.filter(event_type='failed_login').count(),
            'admin_login': log_qs.filter(event_type='admin_login').count(),
            'suspicious_request': log_qs.filter(event_type='suspicious_request').count(),
            'blocked_ip': log_qs.filter(event_type='blocked_ip').count(),
            'rate_limit': log_qs.filter(event_type='rate_limit').count(),
            'unauthorized_access': log_qs.filter(event_type='unauthorized_access').count(),
        }
        
        data = []
        for l in logs:
            data.append({
                'id': l.id,
                'eventType': l.event_type,
                'eventTypeDisplay': l.get_event_type_display(),
                'ipAddress': l.ip_address,
                'details': l.details,
                'userAgent': l.user_agent,
                'timestamp': l.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            })
            
        return Response({
            'logs': data,
            'counts': counts,
            'hasData': log_qs.exists(),
        })


class BiReportingView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'monthly') # daily, weekly, monthly, yearly
        
        # 1. Revenue trends (from QuoteRequests with real quoted prices)
        quotes = QuoteRequest.objects.exclude(status='rejected').filter(quoted_price__isnull=False)
        has_revenue_data = quotes.exists()
        total_revenue = 0
        for q in quotes:
            total_revenue += q.quoted_price * q.quantity

        # Group revenue by date
        # Daily: last 30 days
        # Weekly: last 12 weeks
        # Monthly: last 12 months
        # Yearly: last 5 years
        revenue_trends = []
        now_date = now().date()
        
        if period == 'daily':
            for i in range(29, -1, -1):
                d = now_date - timedelta(days=i)
                day_quotes = QuoteRequest.objects.filter(created_at__date=d, quoted_price__isnull=False)
                rev = sum(q.quoted_price * q.quantity for q in day_quotes)
                revenue_trends.append({'label': d.strftime('%b %d'), 'revenue': float(rev), 'hasData': day_quotes.exists()})
        elif period == 'weekly':
            for i in range(11, -1, -1):
                d_start = now_date - timedelta(weeks=i) - timedelta(days=now_date.weekday())
                d_end = d_start + timedelta(days=6)
                week_quotes = QuoteRequest.objects.filter(created_at__date__range=[d_start, d_end], quoted_price__isnull=False)
                rev = sum(q.quoted_price * q.quantity for q in week_quotes)
                revenue_trends.append({'label': f"Wk {d_start.strftime('%V')}", 'revenue': float(rev), 'hasData': week_quotes.exists()})
        else: # monthly default
            for i in range(11, -1, -1):
                # Back i months
                month = now_date.month - i
                year = now_date.year
                while month <= 0:
                    month += 12
                    year -= 1
                month_quotes = QuoteRequest.objects.filter(
                    created_at__year=year, created_at__month=month, quoted_price__isnull=False
                )
                rev = sum(q.quoted_price * q.quantity for q in month_quotes)
                month_name = datetime(year, month, 1).strftime('%b')
                revenue_trends.append({'label': f"{month_name} {year}", 'revenue': float(rev), 'hasData': month_quotes.exists()})
                
        # 2. Quote pipeline
        pipeline = QuoteRequest.objects.values('status').annotate(count=Count('id'))
        pipeline_data = []
        for p in pipeline:
            status_quotes = QuoteRequest.objects.filter(status=p['status'])
            status_value = sum(
                q.quoted_price * q.quantity
                for q in status_quotes
                if q.quoted_price is not None
            )
            pipeline_data.append({
                'status': p['status'],
                'count': p['count'],
                'value': float(status_value) if status_value else None
            })

        # 3. CRM Lead Conversion
        total_leads = Lead.objects.count()
        converted_leads = Lead.objects.filter(status='converted').count()
        conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0.0

        # Leads by source
        leads_source = Lead.objects.values('source').annotate(count=Count('id'))
        
        # 4. Inventory valuation
        stock_items = StockItem.objects.select_related('product', 'warehouse_location').all()
        has_inventory_value_data = stock_items.filter(product__cost_price__gt=0).exists()
        inventory_value = 0
        warehouse_val = {}
        for item in stock_items:
            val = item.quantity_on_hand * item.product.cost_price
            inventory_value += val
            wh_name = item.warehouse_location.name if item.warehouse_location else 'Unknown'
            warehouse_val[wh_name] = warehouse_val.get(wh_name, 0) + val
            
        warehouse_data = [{'warehouse': k, 'value': float(v)} for k, v in warehouse_val.items()]

        # 5. Search trends
        search_queries = SearchQuery.objects.values('query').annotate(count=Count('id')).order_by('-count')[:5]

        return Response({
            'revenueTrends': revenue_trends,
            'totalRevenue': float(total_revenue) if has_revenue_data else None,
            'hasRevenueData': has_revenue_data,
            'quotePipeline': pipeline_data,
            'leadsStats': {
                'totalLeads': total_leads,
                'convertedLeads': converted_leads,
                'conversionRate': round(conversion_rate, 1) if total_leads > 0 else None,
                'sources': list(leads_source)
            },
            'inventoryValuation': {
                'totalValue': float(inventory_value) if has_inventory_value_data else None,
                'hasValueData': has_inventory_value_data,
                'warehouses': warehouse_data
            },
            'searchTrends': list(search_queries)
        })


class BiExportView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        export_format = request.query_params.get('format', 'csv') # csv, excel
        
        # Generate CSV / Excel spreadsheet content
        quotes = QuoteRequest.objects.select_related('product').all()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="finstar_bi_report_{now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Quote ID', 'Client Name', 'Company', 'Product', 'Quantity', 
            'Unit', 'Quoted Price', 'Total Value', 'Status', 'Date Created'
        ])
        
        for q in quotes:
            prod_name = q.product.name if q.product else q.custom_product_name
            tot_val = (q.quoted_price * q.quantity) if q.quoted_price else 0
            writer.writerow([
                q.id, q.full_name, q.company, prod_name, q.quantity,
                q.unit_of_measure, q.quoted_price or '', tot_val, q.get_status_display(),
                q.created_at.strftime('%Y-%m-%d %H:%M')
            ])
            
        return response


# Website Audit HTML Parser
class AuditHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = None
        self.meta_description = None
        self.h1_count = 0
        self.images = [] # list of sources missing alts
        self.links = [] # list of hrefs
        self.canonical = None
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            if attrs_dict.get('name') == 'description':
                self.meta_description = attrs_dict.get('content')
        elif tag == 'h1':
            self.h1_count += 1
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt')
            # Check if alt is missing or empty
            if alt is None or alt.strip() == '':
                self.images.append(src)
        elif tag == 'a':
            href = attrs_dict.get('href')
            if href:
                self.links.append(href)
        elif tag == 'link':
            if attrs_dict.get('rel') == 'canonical':
                self.canonical = attrs_dict.get('href')
                
    def handle_data(self, data):
        if hasattr(self, 'in_title') and self.in_title:
            self.title = data.strip()
            self.in_title = False


class WebsiteAuditorView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        # Trigger audit scan
        # We find URLs to scan:
        base_domain = "http://localhost:3000"
        site_url = getattr(settings, 'SITE_URL', '').rstrip('/')
        if site_url:
            base_domain = site_url
            
        urls_to_scan = [
            '/',
            '/products',
            '/about',
            '/blog',
            '/contact',
            '/quote',
        ]
        
        # Add dynamic product paths
        for p in Product.objects.filter(status='active')[:10]: # limit to 10 products for speed in local crawl
            urls_to_scan.append(f'/products/{p.slug}')
        # Add blog paths
        for b in BlogPost.objects.filter(status='published')[:5]:
            urls_to_scan.append(f'/blog/{b.slug}')
            
        broken_links = []
        missing_images = []
        missing_metadata = []
        missing_schema = []
        slow_pages = []
        redirect_issues = []
        duplicate_content = {} # {title: [pages]}
        indexing_problems = []
        
        overall_checks = 0
        passed_checks = 0
        
        crawled_ok = True
        
        for path in urls_to_scan:
            full_url = urllib.parse.urljoin(base_domain, path)
            overall_checks += 1
            
            try:
                start_time = time.time()
                # Crawl
                res = requests.get(full_url, timeout=3.0, headers={'User-Agent': 'FinstarSiteAuditor/1.0'})
                duration = time.time() - start_time
                
                # Check status
                if res.status_code != 200:
                    crawled_ok = False
                    broken_links.append({'url': full_url, 'page': path, 'status_code': res.status_code})
                    continue
                else:
                    passed_checks += 1
                    
                # Check performance
                overall_checks += 1
                if duration > 1.5:
                    slow_pages.append({'page': path, 'response_time': round(duration, 2)})
                else:
                    passed_checks += 1
                    
                # Parse content
                parser = AuditHTMLParser()
                parser.feed(res.text)
                
                # Check title
                overall_checks += 1
                if not parser.title:
                    missing_metadata.append({'page': path, 'field_missing': 'Title Tag'})
                else:
                    passed_checks += 1
                    # Duplicate content checks
                    duplicate_content.setdefault(parser.title, []).append(path)
                    
                # Check description
                overall_checks += 1
                if not parser.meta_description:
                    missing_metadata.append({'page': path, 'field_missing': 'Meta Description'})
                else:
                    passed_checks += 1
                    
                # Check canonical
                overall_checks += 1
                if not parser.canonical:
                    missing_metadata.append({'page': path, 'field_missing': 'Canonical URL'})
                else:
                    passed_checks += 1
                    
                # Check H1 structure
                overall_checks += 1
                if parser.h1_count != 1:
                    indexing_problems.append({'page': path, 'reason': f"H1 count is {parser.h1_count} (should be exactly 1)"})
                else:
                    passed_checks += 1
                    
                # Check images alts
                for img in parser.images:
                    overall_checks += 1
                    missing_images.append({'page': path, 'img_src': img})
                    
                # Check structured data / schema
                overall_checks += 1
                if 'application/ld+json' not in res.text:
                    missing_schema.append({'page': path})
                else:
                    passed_checks += 1
                    
            except requests.RequestException:
                # Crawling failed, connection error. Let's record that
                crawled_ok = False
                broken_links.append({'url': full_url, 'page': path, 'status_code': 0})
                
        # If we failed to crawl anything (e.g. dev server offline), fall back to a full DB metadata audit!
        if not crawled_ok and len(broken_links) == len(urls_to_scan):
            # Fallback DB audit
            missing_metadata = []
            missing_schema = []
            
            # Check products
            for p in Product.objects.all():
                if not p.seo_title or not p.seo_description:
                    missing_metadata.append({'page': f'/products/{p.slug}', 'field_missing': 'SEO Title/Description (DB)'})
                if not p.schema_markup:
                    missing_schema.append({'page': f'/products/{p.slug}'})
                    
            # Check categories
            for c in Category.objects.all():
                if not c.seo_title or not c.seo_description:
                    missing_metadata.append({'page': f'/products?category={c.slug}', 'field_missing': 'SEO Title/Description (DB)'})
                    
            # Check blogs
            for b in BlogPost.objects.all():
                if not b.seo_title or not b.seo_description:
                    missing_metadata.append({'page': f'/blog/{b.slug}', 'field_missing': 'SEO Title/Description (DB)'})
                    
            # Set scores accordingly
            passed_checks = max(0, overall_checks - len(missing_metadata) - len(missing_schema))
            indexing_problems.append({'page': 'Crawler Warning', 'reason': 'Dev server offline. Performed database-level fallback metadata audit.'})
            
        # Compute final overall score
        score = int((passed_checks / overall_checks * 100)) if overall_checks > 0 else 100
        score = max(0, min(100, score))
        
        # Identify duplicates
        dup_content_list = []
        for title, pages in duplicate_content.items():
            if len(pages) > 1:
                dup_content_list.append({'field': 'Title tag duplication', 'duplicate_value': title, 'count': len(pages)})

        report = AuditReport.objects.create(
            broken_links_count=len(broken_links),
            broken_links=broken_links,
            missing_images_count=len(missing_images),
            missing_images=missing_images,
            missing_metadata_count=len(missing_metadata),
            missing_metadata=missing_metadata,
            missing_schema_count=len(missing_schema),
            missing_schema=missing_schema,
            slow_pages_count=len(slow_pages),
            slow_pages=slow_pages,
            redirect_issues_count=len(redirect_issues),
            redirect_issues=redirect_issues,
            duplicate_content_count=len(dup_content_list),
            duplicate_content=dup_content_list,
            indexing_problems_count=len(indexing_problems),
            indexing_problems=indexing_problems,
            overall_score=score
        )
        
        return Response({
            'id': report.id,
            'createdAt': report.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'score': report.overall_score,
            'brokenLinks': report.broken_links,
            'missingImages': report.missing_images,
            'missingMetadata': report.missing_metadata,
            'missingSchema': report.missing_schema,
            'slowPages': report.slow_pages,
            'redirectIssues': report.redirect_issues,
            'duplicateContent': report.duplicate_content,
            'indexingProblems': report.indexing_problems
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        reports = AuditReport.objects.all()[:10]
        data = []
        for r in reports:
            data.append({
                'id': r.id,
                'createdAt': r.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'score': r.overall_score,
                'brokenLinksCount': r.broken_links_count,
                'missingImagesCount': r.missing_images_count,
                'missingMetadataCount': r.missing_metadata_count,
                'missingSchemaCount': r.missing_schema_count,
                'slowPagesCount': r.slow_pages_count,
                'duplicateContentCount': r.duplicate_content_count,
                'indexingProblemsCount': r.indexing_problems_count,
            })
        return Response(data)
