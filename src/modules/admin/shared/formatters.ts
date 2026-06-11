import type { Career, Student, Teacher } from '../../../data'

export function normalize(value: string) {
  return value.toLocaleLowerCase('es-PE')
}

export function fullName(person: Pick<Teacher | Student, 'nombres' | 'apellidos'>) {
  return `${person.nombres} ${person.apellidos}`
}

export function getCareerName(careers: Career[], careerId: number) {
  return careers.find((career) => career.carrera_id === careerId)?.nombre ?? 'Sin carrera'
}
