import type { Metadata } from 'next'
import LoginForm from '@/components/admin/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Admin Login | FINSTAR',
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(10,92,245,0.18),transparent_22%)]" />
      <div className="relative w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="section-label">Secure admin access</p>
          <h1 className="mt-4 text-4xl font-bold text-text-primary">FINSTAR control center</h1>
          <p className="mt-3 text-text-secondary">Manage products, content, inquiries, analytics, and security in one responsive dashboard.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}