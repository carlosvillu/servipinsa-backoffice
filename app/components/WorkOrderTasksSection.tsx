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
  fieldsArray: UseFieldArrayReturn<WorkOrderFormData, 'tasks'>
  control: Control<WorkOrderFormData>
}

export function WorkOrderTasksSection({ fieldsArray, control }: Props) {
  return (
    <Card className="border border-[#383838] bg-white">
      <CardHeader>
        <CardTitle className="font-mono text-xl uppercase">
          Trabajos Realizados
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
              name={`tasks.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripcion del trabajo"
                      className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tasks.${index}.startTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tasks.${index}.endTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora fin</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                      {...field}
                    />
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
            fieldsArray.append({ description: '', startTime: '', endTime: '' })
          }
        >
          + Anadir Trabajo
        </Button>
      </CardContent>
    </Card>
  )
}
