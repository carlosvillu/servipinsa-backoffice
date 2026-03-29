import { useEffect, useMemo } from 'react'
import { useSearchParams, useLocation } from 'react-router'
import { toast } from 'sonner'

export function useToastFromSearchParams(
  messages: Record<string, string>
) {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const toastKey = searchParams.get('toast')
  const keys = Object.keys(messages).sort().join(',')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableMessages = useMemo(() => messages, [keys])

  useEffect(() => {
    if (toastKey && stableMessages[toastKey]) {
      toast.success(stableMessages[toastKey])
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('toast')
      const qs = newParams.toString()
      window.history.replaceState(
        {},
        '',
        pathname + (qs ? `?${qs}` : '')
      )
    }
  }, [toastKey, stableMessages, searchParams, pathname])
}
