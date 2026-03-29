type Column<T> = {
  header: string
  render: (row: T) => React.ReactNode
  mono?: boolean
}

const thClass =
  'font-mono text-xs uppercase text-[#757575] tracking-wider pb-2'

export function DetailTable<T>({
  columns,
  rows,
}: {
  columns: Column<T>[]
  rows: T[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#E0E0E0]">
            {columns.map((col) => (
              <th key={col.header} className={thClass}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#E0E0E0] last:border-0">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`py-2 text-[#383838]${col.mono ? ' font-mono' : ''}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
