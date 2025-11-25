'use client'

interface Column {
  key: string
  label: string
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
}

export function DataTable({ columns, data, loading }: DataTableProps) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
          No data available
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #E5E7EB' }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: column.width
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: rowIndex !== data.length - 1 ? '1px solid #E5E7EB' : 'none',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#111827'
                    }}
                  >
                    {row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
