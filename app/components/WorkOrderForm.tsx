import { useWorkOrderForm } from '~/hooks/useWorkOrderForm'
import { Form } from '~/components/ui/form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { WorkOrderTasksSection } from '~/components/WorkOrderTasksSection'
import { WorkOrderLaborSection } from '~/components/WorkOrderLaborSection'
import { WorkOrderMaterialsSection } from '~/components/WorkOrderMaterialsSection'

export function WorkOrderForm() {
  const {
    form,
    tasksFieldArray,
    laborFieldArray,
    materialsFieldArray,
    onSubmit,
    isSubmitting,
  } = useWorkOrderForm()

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        <Card className="border border-[#383838] bg-white">
          <CardHeader>
            <CardTitle className="font-mono text-xl uppercase">
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del cliente"
                      className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                      {...field}
                    />
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
                    <Input
                      placeholder="Direccion del trabajo"
                      className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                      {...field}
                    />
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
                      <Input
                        placeholder="Opcional"
                        className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                        {...field}
                      />
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
                      <Input
                        placeholder="Opcional"
                        className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                        {...field}
                      />
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
                      <Input
                        placeholder="Opcional"
                        className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                        {...field}
                      />
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
          {isSubmitting ? 'Guardando...' : 'Crear Parte de Trabajo'}
        </Button>
      </form>
    </Form>
  )
}
