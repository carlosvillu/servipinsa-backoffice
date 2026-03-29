import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { formatDateTime } from '~/lib/dates'

type ValidationItem = {
  id: string
  validatorName: string
  validatedAt: string
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
