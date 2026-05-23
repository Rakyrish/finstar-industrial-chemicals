import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_ACCESS_COOKIE, canAccessRoute, getAdminSessionFromToken } from '@/lib/admin/auth'

const publicPaths = ['/admin/login', '/api/admin/auth/login', '/api/admin/auth/session']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value
  const session = getAdminSessionFromToken(token)

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!canAccessRoute(session, pathname)) {
    return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}