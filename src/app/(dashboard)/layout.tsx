import Sidebar from '@/components/dashboard/Sidebar'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--of-surface)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DashboardNav />
        <main className="flex-1 px-4 lg:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
