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

export function ValidateWorkOrderDialog() {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button disabled={isSubmitting} />}
      >
        {isSubmitting ? 'Validando...' : 'Validar Parte'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Validar Parte</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción bloqueará el parte para edición. Las validaciones no se
            pueden deshacer. ¿Deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              fetcher.submit(new FormData(), { method: 'post' })
            }}
          >
            Confirmar Validación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
