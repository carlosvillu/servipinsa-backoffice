import { useFetcher } from 'react-router'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

export function CreateUserDialog() {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>()
  const isSubmitting = fetcher.state !== 'idle'

  // Dialog is uncontrolled. On success, the route revalidates and
  // the page re-renders. We use fetcher.Form which handles this.
  // After successful creation, we close via DialogClose triggered by JS.
  const succeeded = fetcher.data?.ok === true && fetcher.state === 'idle'

  return (
    <Dialog key={succeeded ? 'reset' : 'form'}>
      <DialogTrigger render={<Button />}>Nuevo Usuario</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Usuario</DialogTitle>
        </DialogHeader>
        <fetcher.Form method="post" className="flex flex-col gap-4">
          <input type="hidden" name="_action" value="create" />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-name"
              className="font-mono text-xs uppercase tracking-wider text-[#757575]"
            >
              Nombre
            </label>
            <input
              id="create-name"
              name="name"
              type="text"
              required
              className="border border-[#E0E0E0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#383838]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-email"
              className="font-mono text-xs uppercase tracking-wider text-[#757575]"
            >
              Email
            </label>
            <input
              id="create-email"
              name="email"
              type="email"
              required
              className="border border-[#E0E0E0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#383838]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-password"
              className="font-mono text-xs uppercase tracking-wider text-[#757575]"
            >
              Contraseña
            </label>
            <input
              id="create-password"
              name="password"
              type="password"
              required
              minLength={8}
              className="border border-[#E0E0E0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#383838]"
            />
          </div>
          {fetcher.data?.error && (
            <p className="text-sm text-red-600">{fetcher.data.error}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  )
}
