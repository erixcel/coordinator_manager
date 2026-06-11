import { useEffect, useMemo, useState } from 'react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { DataTable } from '../../shared/table'

export function CursosPage() {
  const careers = useAdminStore((state) => state.careers)
  const courses = useAdminStore((state) => state.courses)
  const loadCoursesPage = useAdminStore((state) => state.loadCoursesPage)
  const [careerId, setCareerId] = useState(careers[0] ? String(careers[0].carrera_id) : 'all')
  const [cycle, setCycle] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    void loadCoursesPage()
  }, [loadCoursesPage])

  useEffect(() => {
    if (careers.length > 0 && !careers.some((career) => String(career.carrera_id) === careerId)) {
      setCareerId(String(careers[0].carrera_id))
    }
  }, [careerId, careers])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return courses.filter((course) => {
      const matchesCareer = careerId === 'all' || String(course.carrera_id) === careerId
      const matchesCycle = cycle === 'all' || String(course.ciclo) === cycle
      const matchesQuery = normalize(`${course.codigo} ${course.nombre}`).includes(term)

      return matchesCareer && matchesCycle && matchesQuery
    })
  }, [careerId, courses, cycle, query])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>CURSOS</PageTitle>
        <SearchField onChange={setQuery} placeholder="Buscar curso" value={query} />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <SelectField label="Carrera" onChange={setCareerId} value={careerId}>
          {careers.map((career) => (
            <option key={career.carrera_id} value={String(career.carrera_id)}>
              {career.nombre}
            </option>
          ))}
        </SelectField>
        <SelectField label="Ciclo" onChange={setCycle} value={cycle}>
          <option value="all">Todos los ciclos</option>
          {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((item) => (
            <option key={item} value={item}>
              Ciclo {item}
            </option>
          ))}
        </SelectField>
      </div>
      <DataTable
        columns={['Código', 'Curso', 'Carrera', 'Ciclo', 'Créditos', 'Horas']}
        rows={filtered.map((course) => [
          course.codigo,
          course.nombre,
          getCareerName(careers, course.carrera_id),
          `Ciclo ${course.ciclo}`,
          course.creditos,
          course.horas_semanales,
        ])}
      />
    </section>
  )
}
