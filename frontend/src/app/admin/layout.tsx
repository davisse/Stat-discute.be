import { Sidebar } from './components/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F5'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
