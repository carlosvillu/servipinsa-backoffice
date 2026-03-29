import { redirect } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { getCurrentUser } from '~/lib/auth.server'

export function meta() {
  return [
    { title: 'Servipinsa' },
    {
      name: 'description',
      content: 'Gestión de partes de trabajo',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authSession = await getCurrentUser(request)
  if (!authSession) {
    throw redirect('/auth/login')
  }
  return { user: authSession.user }
}

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFEA]">
      <h1 className="font-mono text-4xl md:text-5xl uppercase text-[#383838]">Servipinsa</h1>
    </div>
  )
}
