import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from '~/lib/auth.client'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        setError('Credenciales inválidas')
        return
      }

      const redirectTo = searchParams.get('redirect') || '/'
      navigate(redirectTo)
    } catch {
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border border-[#383838] bg-white">
        <CardHeader className="text-center">
          <CardTitle className="font-mono text-3xl uppercase">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Tu contraseña"
                        className="bg-white border-[#383838] focus:border-[#2BA5FF]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <div className="p-4 border border-[#383838] bg-[#F4EFEA] text-sm">{error}</div>}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#383838] text-[#F4EFEA] font-mono uppercase border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] transition-all"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
