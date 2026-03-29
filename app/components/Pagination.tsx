import { Link, useSearchParams } from 'react-router'

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const [searchParams] = useSearchParams()

  if (totalPages <= 1) {
    return null
  }

  function pageUrl(page: number): string {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    return `?${params.toString()}`
  }

  const linkClass =
    'border border-[#383838] px-3 py-2 font-mono uppercase text-sm hover:bg-[#383838] hover:text-[#F4EFEA] transition-colors'
  const disabledClass =
    'border border-[#E0E0E0] text-[#E0E0E0] px-3 py-2 font-mono uppercase text-sm cursor-not-allowed'

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-center gap-2 mt-6"
    >
      {currentPage > 1 ? (
        <Link to={pageUrl(currentPage - 1)} className={linkClass}>
          Anterior
        </Link>
      ) : (
        <span className={disabledClass}>Anterior</span>
      )}

      <span className="font-mono text-sm text-[#757575]">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link to={pageUrl(currentPage + 1)} className={linkClass}>
          Siguiente
        </Link>
      ) : (
        <span className={disabledClass}>Siguiente</span>
      )}
    </nav>
  )
}
