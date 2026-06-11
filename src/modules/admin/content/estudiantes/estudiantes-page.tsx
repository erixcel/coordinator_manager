import { useEffect, useMemo, useState } from 'react'
import type { Student } from '../../../../data'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { fullName, getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'
import { DataTable } from '../../shared/table'

function StatusBadge({ value }: { value: Student['merito'] }) {
  const styles = {
    alto: 'bg-[#E9F7EF] text-[#247447]',
    medio: 'bg-[#F7F7F7] text-[#222222]',
    bajo: 'bg-[#FFF0F3] text-[#C11331]',
  }

  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize', styles[value])}>
      {value}
    </span>
  )
}

export function EstudiantesPage() {
  const careers = useAdminStore((state) => state.careers)
  const loadStudentsPage = useAdminStore((state) => state.loadStudentsPage)
  const students = useAdminStore((state) => state.students)
  const [query, setQuery] = useState('')
  const [careerId, setCareerId] = useState('all')

  useEffect(() => {
    void loadStudentsPage()
  }, [loadStudentsPage])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return students.filter((student) => {
      const matchesCareer = careerId === 'all' || String(student.carrera_id) === careerId
      const matchesQuery = normalize(
        `${student.codigo} ${fullName(student)} ${student.telefono} ${student.merito}`,
      ).includes(term)

      return matchesCareer && matchesQuery
    })
  }, [careerId, query, students])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>ESTUDIANTES</PageTitle>
        <SearchField onChange={setQuery} placeholder="Buscar estudiante" value={query} />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <SelectField label="Carrera" onChange={setCareerId} value={careerId}>
          <option value="all">Todas las carreras</option>
          {careers.map((career) => (
            <option key={career.carrera_id} value={String(career.carrera_id)}>
              {career.nombre}
            </option>
          ))}
        </SelectField>
      </div>
      <DataTable
        columns={['Código', 'Nombre', 'Carrera', 'Mérito', 'Teléfono']}
        rows={filtered.map((student) => [
          student.codigo,
          fullName(student),
          getCareerName(careers, student.carrera_id),
          <StatusBadge key={student.estudiante_id} value={student.merito} />,
          student.telefono,
        ])}
      />
    </section>
  )
}
