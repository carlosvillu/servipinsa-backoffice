import type { Control, UseFieldArrayReturn } from 'react-hook-form'
import {
  type WorkOrderFormData,
  WORK_TYPE_VALUES,
  WORK_TYPE_LABELS,
  EMPTY_TASK,
} from '~/schemas/workOrder'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input, inputClassName } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

type Props = {
  fieldsArray: UseFieldArrayReturn<WorkOrderFormData, 'tasks'>
  control: Control<WorkOrderFormData>
}

export function WorkOrderTasksSection({ fieldsArray, control }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-xl uppercase">
          Trabajos Realizados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fieldsArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start border-b border-[#E5E5E5] pb-4 last:border-b-0 last:pb-0"
          >
            <FormField
              control={control}
              name={`tasks.${index}.description`}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripcion del trabajo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tasks.${index}.projectNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero de proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="123/2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tasks.${index}.workType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de trabajo</FormLabel>
                  <FormControl>
                    <select className={inputClassName} {...field}>
                      {WORK_TYPE_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {WORK_TYPE_LABELS[value]}
                        </option>
                      ))}
                    </select>
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
                    <Input type="time" {...field} />
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
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fieldsArray.fields.length > 1 && (
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => fieldsArray.remove(index)}
                >
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => fieldsArray.append(EMPTY_TASK)}
        >
          + Anadir Trabajo
        </Button>
      </CardContent>
    </Card>
  )
}
