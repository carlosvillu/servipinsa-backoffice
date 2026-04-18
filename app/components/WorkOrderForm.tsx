import type { WorkOrderFormData } from '~/schemas/workOrder'
import { useWorkOrderForm } from '~/hooks/useWorkOrderForm'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { todayYYYYMMDD } from '~/lib/dates'
import { WorkOrderTasksSection } from '~/components/WorkOrderTasksSection'
import { WorkOrderLaborSection } from '~/components/WorkOrderLaborSection'
import { WorkOrderMaterialsSection } from '~/components/WorkOrderMaterialsSection'

type WorkOrderFormProps = {
  defaultValues?: Partial<WorkOrderFormData>
  submitLabel?: string
}

export function WorkOrderForm({
  defaultValues,
  submitLabel = 'Crear Parte de Trabajo',
}: WorkOrderFormProps = {}) {
  const {
    form,
    tasksFieldArray,
    laborFieldArray,
    materialsFieldArray,
    onSubmit,
    isSubmitting,
  } = useWorkOrderForm({ defaultValues })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-xl uppercase">
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del parte</FormLabel>
                  <FormControl>
                    <Input type="date" max={todayYYYYMMDD()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Input placeholder="Direccion del trabajo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="carNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero de coche</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor salida</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverReturn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor retorno</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <WorkOrderTasksSection
          fieldsArray={tasksFieldArray}
          control={form.control}
        />

        <WorkOrderLaborSection
          fieldsArray={laborFieldArray}
          control={form.control}
        />

        <WorkOrderMaterialsSection
          fieldsArray={materialsFieldArray}
          control={form.control}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#383838] text-[#F4EFEA] font-mono uppercase border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] transition-all"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </Button>
      </form>
    </Form>
  )
}
