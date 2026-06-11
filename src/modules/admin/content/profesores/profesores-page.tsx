import { useEffect, useMemo, useState } from 'react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField } from '../../shared/controls'
import { fullName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { DataTable } from '../../shared/table'

export function ProfesoresPage() {
  const loadTeachers = useAdminStore((state) => state.loadTeachers)
  const teachers = useAdminStore((state) => state.teachers)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void loadTeachers()
  }, [loadTeachers])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return teachers.filter((teacher) =>
      normalize(`${teacher.codigo} ${fullName(teacher)} ${teacher.email}`).includes(term),
    )
  }, [query, teachers])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>PROFESORES</PageTitle>
        <SearchField onChange={setQuery} placeholder="Buscar profesor" value={query} />
      </div>
      <DataTable
        columns={['Código', 'Nombre', 'Correo']}
        rows={filtered.map((teacher) => [teacher.codigo, fullName(teacher), teacher.email])}
      />
    </section>
  )
}
