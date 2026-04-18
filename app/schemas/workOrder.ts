import { z } from 'zod'
import { todayYYYYMMDD } from '~/lib/dates'

const workOrderTaskSchema = z.object({
  description: z.string().min(1, 'La descripcion es obligatoria'),
  startTime: z.string().min(1, 'La hora de inicio es obligatoria'),
  endTime: z.string().min(1, 'La hora de fin es obligatoria'),
})

const workOrderLaborSchema = z.object({
  technicianName: z.string().min(1, 'El nombre del tecnico es obligatorio'),
  entryTime: z.string().min(1, 'La hora de entrada es obligatoria'),
  exitTime: z.string().min(1, 'La hora de salida es obligatoria'),
})

const workOrderMaterialSchema = z.object({
  units: z.coerce.number().int().min(1, 'Minimo 1 unidad'),
  description: z.string().min(1, 'La descripcion es obligatoria'),
  project: z.string(),
  supply: z.string(),
})

export const workOrderFormSchema = z
  .object({
    createdAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha invalida')
      .refine((value) => value <= todayYYYYMMDD(), {
        message: 'La fecha no puede ser futura',
      }),
    client: z.string().min(1, 'El cliente es obligatorio'),
    address: z.string().min(1, 'La direccion es obligatoria'),
    carNumber: z.string(),
    driverOut: z.string(),
    driverReturn: z.string(),
    tasks: z
      .array(workOrderTaskSchema)
      .min(1, 'Debe haber al menos 1 trabajo'),
    labor: z
      .array(workOrderLaborSchema)
      .min(1, 'Debe haber al menos 1 tecnico'),
    materials: z.array(workOrderMaterialSchema),
  })
  .superRefine((data, ctx) => {
    data.tasks.forEach((task, i) => {
      if (task.startTime && task.endTime && task.endTime <= task.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La hora de fin debe ser posterior a la de inicio',
          path: ['tasks', i, 'endTime'],
        })
      }
    })
    data.labor.forEach((entry, i) => {
      if (
        entry.entryTime &&
        entry.exitTime &&
        entry.exitTime <= entry.entryTime
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La hora de salida debe ser posterior a la de entrada',
          path: ['labor', i, 'exitTime'],
        })
      }
    })
  })

export type WorkOrderFormData = z.infer<typeof workOrderFormSchema>
