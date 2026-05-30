# FINSTAR Enterprise Integration - Testing & Deployment Guide

## Quick Start Testing

### Prerequisites
- Node.js 18+ installed
- Python 3.9+ installed
- PostgreSQL or SQLite configured
- OpenAI API key in `.env`
- Cloudinary account configured

### Step 1: Start Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Step 2: Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Step 3: Verify Configuration
```bash
# Check backend is running
curl http://localhost:8000/api/schema/

# Check frontend is running
curl http://localhost:3000/

# Test admin dashboard
curl http://localhost:8000/api/v1/admin/overview/
```

---

## API Endpoint Testing

### Test Product List
```bash
curl -X GET http://localhost:8000/api/v1/products/chemicals/ \
  -H "Content-Type: application/json"
```

### Test Chatbot
```bash
curl -X POST http://localhost:8000/api/v1/chatbot/message/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what chemicals do you have?"}'
```

### Test Product Generation (Admin)
```bash
curl -X POST http://localhost:8000/api/v1/admin/ai/generate-product/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productName": "Acetone Industrial Grade", "imageUrl": "https://example.com/image.jpg"}'
```

### Test Admin Dashboard
```bash
curl -X GET http://localhost:8000/api/v1/admin/overview/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Frontend Component Testing

### Test Error Handling
```typescript
// In browser console
import { errorTracker } from '@/lib/error-handler'

// Simulate an error
errorTracker.log('TEST_ERROR', 'This is a test error', { test: true })

// View errors
errorTracker.getAll()
```

### Test Performance Monitoring
```typescript
// In browser console
import { performanceMonitor } from '@/lib/performance-monitor'

// Get current metrics
performanceMonitor.getCoreWebVitals()

// Generate report
performanceMonitor.generateReport()
```

### Test Analytics
```typescript
// In browser console
import { analyticsTracker } from '@/lib/analytics-service'

// Track custom event
analyticsTracker.trackEvent('test_event', { data: 'test' })

// Flush events
analyticsTracker.flush()

// Check queue
analyticsTracker.getQueuedEvents()
```

### Test Contact Services
```typescript
// In browser console
import { contactService } from '@/lib/contact-service'

// Get WhatsApp link
contactService.whatsapp.generateLink('Hello!')

// Get phone link
contactService.phone.generateLink()

// Get email link
contactService.email.generateLink('Subject', 'Body')
```

### Test SEO Service
```typescript
// In browser console
import { seoService } from '@/lib/seo-service'

// Generate product schema
seoService.generateProductSchema(product, 'http://localhost:3000')

// Get SEO recommendations
seoService.getSEORecommendations(metadata, content)
```

---

## Browser DevTools Testing

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for API calls:
   - `/api/v1/products/...`
   - `/api/v1/admin/overview/`
   - `/api/v1/chatbot/...`
5. Check status codes (should be 200, 201, etc.)
6. Check response times (should be <1s for most)

### Check Console for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Green warnings are OK
5. Check if error tracking is working:
   - `import { errorTracker } from '@/lib/error-handler'`
   - `errorTracker.getAll()`

### Check Performance
1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Do some actions (click buttons, navigate)
5. Click Stop
6. Analyze the timeline:
   - Looking for long tasks
   - Checking for layout thrashing
   - Verifying Web Vitals

### Check Storage
1. Open DevTools
2. Go to Application tab
3. Check localStorage:
   - `finstar_theme` (light/dark mode)
   - `admin_access_token` (auth token)
4. Check sessionStorage:
   - `finstar_session_id` (analytics session)

---

## Testing Checklist

### ✅ Backend Tests

- [ ] Django server starts without errors
- [ ] Database migrations complete successfully
- [ ] Admin interface accessible at `/admin/`
- [ ] API documentation available at `/api/docs/swagger/`
- [ ] Product list endpoint returns data
- [ ] Category list endpoint returns data
- [ ] Chatbot endpoint accepts messages
- [ ] Admin overview endpoint returns metrics
- [ ] OpenAI API key is configured
- [ ] Cloudinary credentials are configured

### ✅ Frontend Tests

- [ ] Next.js dev server starts without errors
- [ ] Homepage loads without console errors
- [ ] All navigation links work
- [ ] Theme toggle works (light/dark mode)
- [ ] Product pages load
- [ ] Admin dashboard loads
- [ ] API calls use error handler
- [ ] Performance monitoring is active
- [ ] Analytics tracking is sending data
- [ ] Contact services work (WhatsApp/Phone)

### ✅ Integration Tests

- [ ] Admin dashboard displays real data
- [ ] Product list shows real products
- [ ] Chatbot responds to messages
- [ ] AI product generation works
- [ ] Error handling catches API failures
- [ ] Performance metrics are collected
- [ ] Analytics events are tracked
- [ ] SEO metadata is generated
- [ ] Images load from Cloudinary
- [ ] WhatsApp/Phone links work

### ✅ Performance Tests

- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.8s
- [ ] Largest Contentful Paint <2.5s
- [ ] Cumulative Layout Shift <0.1
- [ ] API response time <500ms
- [ ] Page load time <3s

### ✅ SEO Tests

- [ ] Title tags are present and unique
- [ ] Meta descriptions are present
- [ ] Keywords are defined
- [ ] JSON-LD schemas are present
- [ ] Canonical URLs are set
- [ ] OpenGraph tags are present
- [ ] Robots.txt exists
- [ ] Sitemap exists
- [ ] Internal links are present
- [ ] Alt text on images

### ✅ Security Tests

- [ ] No API keys in console
- [ ] Auth tokens stored securely
- [ ] CORS headers are correct
- [ ] No exposed sensitive data
- [ ] HTTPS enforced (in production)
- [ ] Environment variables secured
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] CSRF protection enabled
- [ ] Rate limiting in place

---

## Common Issues & Fixes

### Issue: "Cannot GET /api/v1/products/"
**Solution**: Backend not running or CORS not configured
```bash
# Start backend
python manage.py runserver

# Check CORS settings in backend/config/settings/base.py
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
```

### Issue: "OPENAI_API_KEY not found"
**Solution**: Add API key to `.env`
```bash
# In .env file
OPENAI_API_KEY=sk-proj-...
```

### Issue: "Cloudinary URL invalid"
**Solution**: Check Cloudinary configuration
```bash
# In .env file
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Issue: "Theme toggle not persisting"
**Solution**: Check localStorage
```typescript
// In browser console
localStorage.getItem('finstar_theme')
localStorage.setItem('finstar_theme', 'light')
```

### Issue: "Admin dashboard shows mock data"
**Solution**: Backend API not responding
```bash
# Check backend is running
curl http://localhost:8000/api/v1/admin/overview/

# Check logs
python manage.py runserver --verbosity 2
```

---

## Production Deployment

### Environment Variables

**Backend Production**:
```bash
DEBUG=False
SECRET_KEY=your-very-secret-key-change-this
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@host/db
OPENAI_API_KEY=sk-proj-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend Production**:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_WHATSAPP_NUMBER=...
NEXT_PUBLIC_PHONE_NUMBER=...
NEXT_PUBLIC_COMPANY_EMAIL=...
```

### Build Frontend
```bash
cd frontend
npm run build
npm run start
```

### Deploy Backend
```bash
# Using Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000

# Using Docker (if available)
docker build -t finstar-backend .
docker run -p 8000:8000 finstar-backend
```

### SSL/HTTPS
1. Obtain SSL certificate (Let's Encrypt recommended)
2. Configure in web server (nginx/Apache)
3. Update `ALLOWED_HOSTS` and `SECURE_SSL_REDIRECT`
4. Update frontend `NEXT_PUBLIC_API_URL` to use https://

### Database Backups
```bash
# Backup PostgreSQL
pg_dump finstar > finstar_backup.sql

# Restore
psql finstar < finstar_backup.sql
```

### Monitoring
1. Set up error tracking (Sentry recommended)
2. Set up performance monitoring (DataDog, New Relic)
3. Set up uptime monitoring (Pingdom, UptimeRobot)
4. Set up log aggregation (CloudWatch, Datadog)

---

## Post-Launch Checklist

- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Email notifications working
- [ ] Backups configured
- [ ] Monitoring alerts configured
- [ ] Analytics tracking verified
- [ ] Chat support tested
- [ ] Contact forms tested
- [ ] Payment system tested (if applicable)
- [ ] SEO verification (Google Search Console)
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed

---

## Support & Debugging

### Enable Debug Logging

**Backend**:
```python
# In settings
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Frontend**:
```typescript
// In lib/api.ts
if (process.env.NODE_ENV === 'development') {
  console.log('API Request:', url, data)
}
```

### View Error Logs

**Backend**:
```bash
# Check Django logs
tail -f logs/django.log

# Check Gunicorn logs
tail -f logs/gunicorn.log
```

**Frontend**:
```typescript
// In browser console
import { errorTracker } from '@/lib/error-handler'
errorTracker.getAll()
errorTracker.sendToBackend()
```

---

## Performance Optimization

### Frontend Optimization
1. Enable gzip compression
2. Implement code splitting
3. Optimize images
4. Cache resources
5. Minimize CSS/JS
6. Defer non-critical JavaScript

### Backend Optimization
1. Enable database query caching
2. Implement Redis caching
3. Use database connection pooling
4. Enable query optimization
5. Set up CDN for static files
6. Implement rate limiting

---

**For questions or issues, refer to the ENTERPRISE_INTEGRATION_REPORT.md**
