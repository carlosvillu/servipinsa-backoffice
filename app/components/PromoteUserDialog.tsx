import { useFetcher } from 'react-router'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'

type PromoteUserDialogProps = {
  userId: string
  userName: string
}

export function PromoteUserDialog({
  userId,
  userName,
}: PromoteUserDialogProps) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" size="sm" disabled={isSubmitting} />}
      >
        {isSubmitting ? 'Promoviendo...' : 'Promover a Manager'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promover Usuario</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Promover a {userName} al rol MANAGER? Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const formData = new FormData()
              formData.set('_action', 'promote')
              formData.set('userId', userId)
              fetcher.submit(formData, { method: 'post' })
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
