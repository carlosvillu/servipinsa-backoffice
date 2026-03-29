import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'El nombre es obligatorio'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
