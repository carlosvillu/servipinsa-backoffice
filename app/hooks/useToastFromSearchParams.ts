import { useEffect, useRef } from 'react'
import { useSearchParams, useLocation } from 'react-router'
import { toast } from 'sonner'

export function useToastFromSearchParams(
  messages: Record<string, string>
) {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const toastKey = searchParams.get('toast')
  const shownRef = useRef<string | null>(null)

  useEffect(() => {
    if (toastKey && messages[toastKey] && shownRef.current !== toastKey) {
      shownRef.current = toastKey
      toast.success(messages[toastKey])
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('toast')
      const qs = newParams.toString()
      window.history.replaceState(
        {},
        '',
        pathname + (qs ? `?${qs}` : '')
      )
    }
  }, [toastKey, messages, searchParams, pathname])
}
