export default function AdminSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card h-32" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card h-32" />
        <div className="card h-32" />
        <div className="card h-32" />
        <div className="card h-32" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card h-80" />
        <div className="card h-80" />
      </div>
      <div className="card h-96" />
    </div>
  )
}