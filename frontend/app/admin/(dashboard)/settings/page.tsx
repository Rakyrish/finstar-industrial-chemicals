import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Configure company details, security preferences, email integrations, and workflow defaults." />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-6">
          <h3 className="text-lg font-bold text-text-primary">Company profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input-base" placeholder="Company name" defaultValue="FINSTAR" />
            <input className="input-base" placeholder="Support email" defaultValue="info@finstarindustrialchemicals.co.ke" />
            <input className="input-base sm:col-span-2" placeholder="Address" defaultValue="KCB Building, Enterprise Road, Industrial Area, Nairobi" />
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h3 className="text-lg font-bold text-text-primary">Security</h3>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>JWT session persistence is enabled through HttpOnly cookies.</p>
            <p>Role-based access separates Admin, Editor, and Support permissions.</p>
            <p>Adjust backend auth endpoints in the admin API route handlers when your Django auth URLs are finalized.</p>
          </div>
        </div>
      </section>
    </div>
  )
}