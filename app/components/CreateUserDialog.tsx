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
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

export function CreateUserDialog() {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>()
  const isSubmitting = fetcher.state !== 'idle'

  // Key swap forces remount to reset form + close dialog after success
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
            <Label htmlFor="create-name">Nombre</Label>
            <Input id="create-name" name="name" type="text" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-password">Contraseña</Label>
            <Input
              id="create-password"
              name="password"
              type="password"
              required
              minLength={8}
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
