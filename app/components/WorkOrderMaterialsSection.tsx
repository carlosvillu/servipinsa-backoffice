import { useFormState, type Control, type UseFieldArrayReturn } from 'react-hook-form'
import type { WorkOrderFormData } from '~/schemas/workOrder'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

type Props = {
  fieldsArray: UseFieldArrayReturn<WorkOrderFormData, 'materials'>
  control: Control<WorkOrderFormData>
}

export function WorkOrderMaterialsSection({ fieldsArray, control }: Props) {
  const { errors } = useFormState({ control, name: 'materials' })
  const rootMessage =
    errors.materials && !Array.isArray(errors.materials)
      ? errors.materials.root?.message ?? errors.materials.message
      : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-xl uppercase">
          Materiales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rootMessage && (
          <p data-slot="materials-error" className="text-destructive text-sm">
            {rootMessage}
          </p>
        )}
        {fieldsArray.fields.length === 0 && (
          <p className="text-[#757575] font-sans text-sm">
            No hay materiales anadidos.
          </p>
        )}
        {fieldsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-start"
          >
            <FormField
              control={control}
              name={`materials.${index}.units`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidades</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      className="w-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`materials.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripcion del material" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`materials.${index}.project`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="Proyecto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`materials.${index}.supply`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suministro</FormLabel>
                  <FormControl>
                    <Input placeholder="Suministro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              className="mt-6"
              onClick={() => fieldsArray.remove(index)}
            >
              Eliminar
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            fieldsArray.append({
              units: 1,
              description: '',
              project: '',
              supply: '',
            })
          }
        >
          + Anadir Material
        </Button>
      </CardContent>
    </Card>
  )
}
