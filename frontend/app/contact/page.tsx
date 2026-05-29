'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { frontendConfig } from '@/lib/config'
import { quoteService } from '@/services/quoteService'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await quoteService.submitContact({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        message: form.message,
      })
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', company: '', message: '' })
    } catch (error: any) {
      setError(error?.response?.data?.detail || error?.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      {/* Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Get In Touch</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            Contact Finstar Chemicals
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Have questions about product availability, safety compliance, or custom formulations? Reach out to our technical sales team today.
          </p>
        </div>
      </header>

      {/* Main Content split */}
      <div className="container-wide py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <main className="lg:col-span-7 glass-card p-6 md:p-8 border border-surface-border">
            <h2 className="font-display font-semibold text-lg text-text-primary mb-2">
              Send a Sourcing Message
            </h2>
            <p className="text-xs text-text-muted mb-8">
              Fill in the form below. A certified chemical sales representative will review your message and respond within 12 hours.
            </p>

            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-text-secondary mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block mb-1">Message Dispatched</span>
                  Thank you! Your sourcing message was sent successfully. Our team will review it and reply shortly.
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-text-secondary mb-6">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block mb-1">Validation Error</span>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="label-base">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="input-base text-xs"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="label-base">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. name@company.com"
                    className="input-base text-xs"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="label-base">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +254 700 000 000"
                    className="input-base text-xs"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="company" className="label-base">Company / Institution</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. paint manufactures ltd"
                    className="input-base text-xs"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="label-base">
                  Chemical Sourcing Details / Inquiry <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need..."
                  rows={6}
                  className="input-base text-xs resize-none"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </main>

          {/* Right Column: Direct Info & Warehouse Hours */}
          <aside className="lg:col-span-5 space-y-6">
            {/* Quick Contact info */}
            <div className="glass-card p-6 md:p-8 border border-surface-border space-y-6">
              <h2 className="font-display font-semibold text-base text-text-primary">
                Direct Contact Channels
              </h2>

              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Email Support</span>
                    <a href={`mailto:${frontendConfig.companyEmail}`} className="text-sm font-medium text-text-primary hover:text-amber-400 transition-colors">
                      {frontendConfig.companyEmail}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Sales Hotlines</span>
                    <a href={`tel:${frontendConfig.phoneNumber.replace(/\s/g, '')}`} className="text-sm font-medium text-text-primary hover:text-amber-400 transition-colors">
                      {frontendConfig.phoneNumber}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <a href="/contact" className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 hover:bg-amber-500/20 hover:border-amber-500/40 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </a>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Headquarters Warehouse</span>
                    <span className="text-xs text-text-secondary leading-relaxed">Contact sales for dispatch and warehouse details.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Warehouse hours */}
            <div className="glass-card p-6 md:p-8 border border-surface-border space-y-4">
              <h2 className="font-display font-semibold text-base text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Warehouse & Lab Hours
              </h2>
              <div className="divide-y divide-surface-border text-xs text-text-secondary">
                <div className="flex justify-between py-2.5">
                  <span className="text-text-muted">Monday - Friday</span>
                  <span className="font-medium text-text-primary">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-text-muted">Saturdays</span>
                  <span className="font-medium text-text-primary">8:30 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-text-muted">Sundays & Holidays</span>
                  <span className="font-medium text-text-muted italic">Closed / Scheduled Dispatch Only</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
