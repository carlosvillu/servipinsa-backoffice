import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

type ValidationItem = {
  id: string
  validatorName: string
  validatedAt: string
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkOrderValidations({
  validations,
}: {
  validations: ValidationItem[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-xl uppercase">
          Validaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validations.length === 0 ? (
          <p className="text-[#757575] font-mono text-sm">Sin validaciones</p>
        ) : (
          <ul className="space-y-2">
            {validations.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 text-[#383838]"
              >
                <span className="inline-block w-2 h-2 bg-[#2BA5FF]" />
                <span className="font-mono text-sm">
                  {v.validatorName} — {formatDateTime(v.validatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
