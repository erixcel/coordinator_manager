type StudentPlaceholderPageProps = {
  description: string
  title: string
}

export function StudentPlaceholderPage({ description, title }: StudentPlaceholderPageProps) {
  return (
    <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
      <p className="text-sm font-semibold uppercase text-[#8b2332]">Portal del alumno</p>
      <h1 className="mt-3 text-[26px] font-semibold text-[#1f2937]">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">{description}</p>
    </section>
  )
}
