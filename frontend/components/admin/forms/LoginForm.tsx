"use client"

import { message } from 'antd'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { adminLoginSchema } from '@/lib/admin/schemas'
import type { AdminLoginPayload } from '@/types/admin'
import { cn } from '@/utils'
import { useAdminAuth } from '../AdminAuthProvider'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAdminAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginPayload>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '' },
  })

  const onSubmit = async (values: AdminLoginPayload) => {
    try {
      await login(values)
      message.success('Welcome back. Signed in with Django admin credentials.')
      const nextPath = searchParams.get('next') ?? '/admin'
      router.replace(nextPath)
      router.refresh()
    } catch {
      message.error('Login failed. Invalid username/password or insufficient admin access.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card mx-auto w-full max-w-xl space-y-5 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin login</h1>
          <p className="text-sm text-text-secondary">Use your Django username and password to access the admin dashboard.</p>
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-text-primary">Username</span>
        <input {...register('username')} type="text" className="input-base" placeholder="admin" autoComplete="username" />
        {errors.username ? <span className="text-sm text-red-400">{errors.username.message}</span> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-text-primary">Password</span>
        <input {...register('password')} type="password" className="input-base" placeholder="••••••••" />
        {errors.password ? <span className="text-sm text-red-400">{errors.password.message}</span> : null}
      </label>

      <button type="submit" disabled={isSubmitting} className={cn('btn-primary w-full justify-center', isSubmitting && 'opacity-70')}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Signing in...' : 'Access dashboard'}
      </button>

      <p className="text-xs text-text-muted">Sessions are stored as HttpOnly cookies and authenticated against Django staff or superuser accounts only.</p>
    </form>
  )
}
