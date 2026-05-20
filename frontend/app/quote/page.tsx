'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Phone,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { productService } from '@/services/productService'
import { quoteService } from '@/services/quoteService'
import type { ProductListItem } from '@/types'

export default function QuoteWizardPage() {
  const searchParams = useSearchParams()
  const initialProductSlug = searchParams.get('product')

  const [step, setStep] = useState(1)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Form State
  const [form, setForm] = useState({
    productId: '',
    customProductName: '',
    quantity: '',
    unitOfMeasure: 'KG',
    purityRequired: 'Technical Grade',
    packagingPreference: 'IBC Tote (1000L)',
    casNumber: '',
    targetPrice: '',
    needMSDS: true,
    needCOA: true,
    fullName: '',
    email: '',
    phone: '',
    company: '',
    deliveryAddress: '',
    additionalNotes: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch product list for dropdown selection
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true)
      try {
        const result = await productService.list({ pageSize: 100 })
        setProducts(result.results)

        // If product slug query exists, pre-select it
        if (initialProductSlug) {
          const matched = result.results.find((p) => p.slug === initialProductSlug)
          if (matched) {
            setForm((f) => ({
              ...f,
              productId: matched.id,
              unitOfMeasure: matched.unitOfMeasure || 'KG',
              customProductName: matched.name,
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load products for wizard:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [initialProductSlug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setForm((f) => ({ ...f, [name]: target.checked }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  // Pre-fill fields on select product change
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value
    setForm((f) => ({ ...f, productId: prodId }))
    const found = products.find((p) => p.id === prodId)
    if (found) {
      setForm((f) => ({
        ...f,
        unitOfMeasure: found.unitOfMeasure || 'KG',
        customProductName: found.name,
      }))
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!form.productId && !form.customProductName) {
        setError('Please select a chemical compound or enter custom product name.')
        return
      }
      setError(null)
      setStep(2)
    } else if (step === 2) {
      if (!form.quantity) {
        setError('Please state requested volume / quantity.')
        return
      }
      setError(null)
      setStep(3)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => s - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.phone || !form.company) {
      setError('Please fill in all requested client details.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await quoteService.create({
        product: form.productId || undefined,
        customProductName: form.productId ? undefined : form.customProductName,
        quantity: parseFloat(form.quantity),
        unitOfMeasure: form.unitOfMeasure,
        purityRequired: form.purityRequired,
        packagingPreference: form.packagingPreference,
        targetPrice: form.targetPrice ? parseFloat(form.targetPrice) : undefined,
        needMSDS: form.needMSDS,
        needCOA: form.needCOA,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        company: form.company,
        deliveryAddress: form.deliveryAddress,
        additionalNotes: form.additionalNotes,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred submitting the quote request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      {/* Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Interactive Wizard</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            Request an Industrial Quote
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Submit your chemical specifications. Our pricing office will draft a custom, itemized PDF quote with competitive regional delivery in under 24 hours.
          </p>
        </div>
      </header>

      {/* Progress Steps Indicator */}
      <div className="container-wide max-w-3xl mt-12 mb-8">
        <div className="flex items-center justify-between relative px-2">
          {/* Timeline Connector Line */}
          <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-surface-border z-0" />
          <div
            className="absolute top-[18px] left-0 h-[2px] bg-amber-500 transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {/* Step dots */}
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => num < step && setStep(num)}
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all border ${
                step === num
                  ? 'bg-amber-500 text-white border-amber-500 shadow-glow-amber scale-105'
                  : step > num
                  ? 'bg-brand-600 text-brand-100 border-brand-500/30'
                  : 'bg-surface-card text-text-muted border-surface-border'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-muted mt-2 px-1">
          <span>1. Sourcing Compound</span>
          <span>2. Vol. & Specs</span>
          <span>3. Client Details</span>
        </div>
      </div>

      {/* Main Form container */}
      <div className="container-wide max-w-3xl">
        <div className="glass-card p-6 md:p-8 border border-surface-border">
          {success ? (
            /* Success State */
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 shadow-glow-blue animate-pulse">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary">
                Quote Request Submitted
              </h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Thank you! Your technical specs have been received by our pricing desk. We are currently verifying product availability and regional logistic schedules.
              </p>
              <div className="p-4 rounded-xl border border-surface-border bg-surface-muted/40 max-w-sm mx-auto text-xs text-text-muted">
                An automated confirmation email has been dispatched. Our verified PDF quote will arrive in under 24 hours.
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    setStep(1)
                    setSuccess(false)
                  }}
                  className="btn-primary text-xs"
                >
                  Submit Another request
                </button>
                <a href="/" className="btn-secondary text-xs">
                  Return Home
                </a>
              </div>
            </div>
          ) : (
            /* Wizard Steps */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-text-secondary">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block mb-1">Warning</span>
                    {error}
                  </div>
                </div>
              )}

              {/* Step 1: Product Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-display font-semibold text-base text-gradient-brand">
                      Step 1: Choose Chemical Compound
                    </h2>
                    <p className="text-[11px] text-text-muted">
                      Select from our current catalogue, or state custom formulation parameters below.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label htmlFor="productId" className="label-base">
                        Select Sourced Product
                      </label>
                      <select
                        id="productId"
                        name="productId"
                        value={form.productId}
                        onChange={handleProductChange}
                        className="input-base text-xs bg-surface-card"
                        disabled={loadingProducts}
                      >
                        <option value="">-- Choose from Catalogue --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.casNumber ? `(CAS: ${p.casNumber})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-surface-border" />
                      <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-text-muted">
                        Or enter manually
                      </span>
                      <div className="flex-grow border-t border-surface-border" />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="customProductName" className="label-base">
                        Compound Name / Description
                      </label>
                      <input
                        type="text"
                        id="customProductName"
                        name="customProductName"
                        value={form.customProductName}
                        onChange={handleChange}
                        placeholder="e.g. Sulphuric Acid 98%, Special Solvent Blending"
                        className="input-base text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specifying Sourcing Specs */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-display font-semibold text-base text-gradient-brand">
                      Step 2: Volume & Sourcing Specifications
                    </h2>
                    <p className="text-[11px] text-text-muted">
                      State purity parameters, low-stock reorder schedule preferences, and volume bounds.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label htmlFor="quantity" className="label-base">
                        Volume / Quantity <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 5000"
                        className="input-base text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="unitOfMeasure" className="label-base">
                        Unit
                      </label>
                      <select
                        id="unitOfMeasure"
                        name="unitOfMeasure"
                        value={form.unitOfMeasure}
                        onChange={handleChange}
                        className="input-base text-xs bg-surface-card"
                      >
                        <option value="KG">Kilograms (KG)</option>
                        <option value="L">Liters (L)</option>
                        <option value="MT">Metric Tons (MT)</option>
                        <option value="DRUM">200L Drums</option>
                        <option value="IBC">1000L IBC Totes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="purityRequired" className="label-base">
                        Purity Grade
                      </label>
                      <select
                        id="purityRequired"
                        name="purityRequired"
                        value={form.purityRequired}
                        onChange={handleChange}
                        className="input-base text-xs bg-surface-card"
                      >
                        <option value="Technical Grade">Technical Grade (&gt;95%)</option>
                        <option value="Analytical Grade">Analytical Reagent Grade (&gt;99%)</option>
                        <option value="Food Grade">Food / Pharmaceutical Grade</option>
                        <option value="Custom Concentration">Custom Blending Formulation</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="packagingPreference" className="label-base">
                        Packaging Pref
                      </label>
                      <select
                        id="packagingPreference"
                        name="packagingPreference"
                        value={form.packagingPreference}
                        onChange={handleChange}
                        className="input-base text-xs bg-surface-card"
                      >
                        <option value="IBC Tote (1000L)">IBC Tote (1000L)</option>
                        <option value="Steel / Plastic Drum (200L)">Steel / Plastic Drum (200L)</option>
                        <option value="Bulk Tanker Truck">Bulk Tanker Truck</option>
                        <option value="Jerrycan (25L)">Jerrycan (25L)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="casNumber" className="label-base">CAS Number (optional)</label>
                      <input
                        type="text"
                        id="casNumber"
                        name="casNumber"
                        value={form.casNumber}
                        onChange={handleChange}
                        placeholder="e.g. 7664-93-9"
                        className="input-base text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="targetPrice" className="label-base">
                        Target Price (per unit - KES)
                      </label>
                      <input
                        type="number"
                        id="targetPrice"
                        name="targetPrice"
                        value={form.targetPrice}
                        onChange={handleChange}
                        placeholder="Optional target budget"
                        className="input-base text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        name="needMSDS"
                        checked={form.needMSDS}
                        onChange={handleChange}
                        className="rounded border-surface-border text-amber-500 bg-surface-muted"
                      />
                      <span>Request MSDS Sheet</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        name="needCOA"
                        checked={form.needCOA}
                        onChange={handleChange}
                        className="rounded border-surface-border text-amber-500 bg-surface-muted"
                      />
                      <span>Request Certificate of Analysis (COA)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Client Info */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-display font-semibold text-base text-gradient-brand">
                      Step 3: Client Sourcing Info & Destination
                    </h2>
                    <p className="text-[11px] text-text-muted">
                      Your data is fully secure and handled under compliance guidelines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label htmlFor="fullName" className="label-base">
                        Full Sourcing Contact Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className="input-base text-xs"
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
                        placeholder="e.g. jdoe@company.com"
                        className="input-base text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="label-base">
                        Phone Sourcing Hotlines <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="e.g. +254 700 000 000"
                        className="input-base text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="company" className="label-base">
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="e.g. paint manufactures ltd"
                        className="input-base text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="deliveryAddress" className="label-base">
                      Delivery Address / Destination Port
                    </label>
                    <input
                      type="text"
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={form.deliveryAddress}
                      onChange={handleChange}
                      placeholder="e.g. Industrial Area warehouse 4, Nairobi"
                      className="input-base text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="additionalNotes" className="label-base">
                      Additional Notes / Custom blenders params
                    </label>
                    <textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      value={form.additionalNotes}
                      onChange={handleChange}
                      placeholder="Any specialized notes or instructions..."
                      rows={3}
                      className="input-base text-xs resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Wizard Nav buttons */}
              <div className="flex justify-between pt-6 border-t border-surface-border mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                    disabled={submitting}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting specs...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Custom PDF Quote</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
