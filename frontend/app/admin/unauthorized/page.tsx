import Link from 'next/link'

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card max-w-lg rounded-3xl p-8 text-center">
        <p className="section-label mx-auto">Access denied</p>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">You do not have admin access</h1>
        <p className="mt-3 text-text-secondary">This area is limited to Django users with staff or superuser permissions.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/admin/login" className="btn-primary">Go to login</Link>
          <Link href="/" className="btn-secondary">Return home</Link>
        </div>
      </div>
    </div>
  )
}