import type { Control, UseFieldArrayReturn } from 'react-hook-form'
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
  fieldsArray: UseFieldArrayReturn<WorkOrderFormData, 'labor'>
  control: Control<WorkOrderFormData>
}

export function WorkOrderLaborSection({ fieldsArray, control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-xl uppercase">
          Mano de Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fieldsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-start"
          >
            <FormField
              control={control}
              name={`labor.${index}.technicianName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del tecnico</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del tecnico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`labor.${index}.entryTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora entrada</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`labor.${index}.exitTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora salida</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fieldsArray.fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                className="mt-6"
                onClick={() => fieldsArray.remove(index)}
              >
                Eliminar
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            fieldsArray.append({
              technicianName: '',
              entryTime: '',
              exitTime: '',
            })
          }
        >
          + Anadir Tecnico
        </Button>
      </CardContent>
    </Card>
  )
}
