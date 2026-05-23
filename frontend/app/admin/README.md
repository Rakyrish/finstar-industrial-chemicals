# FINSTAR Admin Dashboard

This folder contains the full admin panel scaffold for the FINSTAR industrial chemicals website.

## Routes

- `/admin` - dashboard overview
- `/admin/login` - admin login
- `/admin/products` and `/admin/products/new`
- `/admin/blog` and `/admin/blog/new`
- `/admin/inquiries`
- `/admin/quotes`
- `/admin/chatbot`
- `/admin/inventory`
- `/admin/analytics`
- `/admin/seo`
- `/admin/settings`
- `/admin/users`

## Architecture

- App Router layouts live under `app/admin/`.
- `middleware.ts` protects admin pages and API routes.
- `app/api/admin/*` provides secure proxy/auth endpoints and mock fallbacks.
- `components/admin/*` contains shared shell, charts, tables, forms, toasts, and loading states.
- `lib/admin/*` contains auth helpers, mock data, validation schemas, navigation config, and server/client data helpers.

## Auth Flow

- Login posts to `/api/admin/auth/login`.
- The route attempts a backend JWT login first.
- If the backend is unavailable in development, it falls back to a mock session.
- The middleware reads the admin access cookie and enforces role-based route access.

## Backend Integration

The scaffold expects a Django REST API and uses these configurable backend paths as examples:

- `NEXT_PUBLIC_API_URL` or `ADMIN_BACKEND_URL`
- `authentication` JWT endpoints
- `products`, `blog`, `inquiries`, `quote`, `chatbot`, `inventory`, `analytics`, `seo`, `crm`, `users`

If the backend endpoints differ, update the mappings in:

- `lib/admin/server.ts`
- `app/api/admin/auth/login/route.ts`
- `app/api/admin/[resource]/route.ts`

## UI Features

- Responsive sidebar and topbar
- Dark/light mode toggle with cookie persistence
- Toast notifications
- Loading skeletons
- Search and filter bars
- Table and chart components
- Form validation with `react-hook-form` and `zod`

## Next Steps

- Wire the resource routes to exact Django serializers and viewsets.
- Replace mock fallback records with live API data.
- Add richer editor integrations for blog content if required.
- Add E2E coverage for login, product creation, and quote triage.
