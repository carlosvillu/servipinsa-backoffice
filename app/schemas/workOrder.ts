import { z } from 'zod'
import { todayYYYYMMDD } from '~/lib/dates'

export const WORK_TYPE_VALUES = [
  'visita_tecnica',
  'oficina',
  'obra',
  'punto_recarga',
  'postventa',
  'averia',
] as const

export type WorkType = (typeof WORK_TYPE_VALUES)[number]

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  visita_tecnica: 'Visita Tecnica',
  oficina: 'Oficina',
  obra: 'Obra',
  punto_recarga: 'Punto de Recarga',
  postventa: 'Postventa',
  averia: 'Averia',
}

const PROJECT_NUMBER_REGEX = /^\d+\/\d{4}$/

const workOrderTaskSchema = z.object({
  description: z.string().min(1, 'La descripcion es obligatoria'),
  startTime: z.string().min(1, 'La hora de inicio es obligatoria'),
  endTime: z.string().min(1, 'La hora de fin es obligatoria'),
  projectNumber: z
    .string()
    .min(1, 'El numero de proyecto es obligatorio')
    .regex(PROJECT_NUMBER_REGEX, 'Formato invalido (ID/YYYY)'),
  workType: z.enum(WORK_TYPE_VALUES, {
    message: 'Tipo de trabajo invalido',
  }),
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

    const taskProjects = new Set(
      data.tasks
        .map((t) => t.projectNumber)
        .filter((p) => PROJECT_NUMBER_REGEX.test(p)),
    )
    const materialProjects = new Set(
      data.materials.map((m) => m.project).filter(Boolean),
    )
    for (const project of taskProjects) {
      if (!materialProjects.has(project)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Falta al menos un material para el proyecto ${project}`,
          path: ['materials'],
        })
      }
    }
  })

export type WorkOrderFormData = z.infer<typeof workOrderFormSchema>
