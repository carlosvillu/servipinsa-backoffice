export function DetailField({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase text-[#757575] tracking-wider">
        {label}
      </dt>
      <dd className="text-[#383838] mt-1">{value || '—'}</dd>
    </div>
  )
}
