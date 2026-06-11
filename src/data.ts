export type Teacher = {
  docente_id: number
  codigo: string
  nombres: string
  apellidos: string
  email: string
  dias_disponibles?: string
  horas_disponibles?: string
}

export type Student = {
  estudiante_id: number
  codigo: string
  nombres: string
  apellidos: string
  telefono: string
  direccion: string
  merito: 'alto' | 'medio' | 'bajo'
  carrera_id: number
}

export type Career = {
  carrera_id: number
  nombre: string
  facultad: string
}

export type Course = {
  curso_id: number
  codigo: string
  nombre: string
  ciclo: number
  creditos: string
  horas_semanales: string
  carrera_id: number
  creditos_imputados: boolean
  horas_imputadas: boolean
}

export type Curriculum = {
  carrera_id: number
  curso_id: number
}

export type CareerDistribution = {
  carrera_id: number
  nombre: string
  facultad: string
  student_count: number
  course_count: number
}

export type AcademicSummary = {
  teachers: number
  students: number
  careers: number
  courses: number
  curriculum: number
  total_credits: number
  high_merit_students: number
  cycles_available: number
  career_distribution: CareerDistribution[]
}

export type CareerStats = CareerDistribution & {
  total_credits: number
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api/academic'
const AGENT_API_BASE_URL = API_BASE_URL.replace(/\/api\/academic$/, '/api/agent')

type PaginatedResponse<T> = {
  results: T[]
}

function unwrapList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results
}

async function loadApiList<T>(path: string): Promise<T[]> {
  const url = `${API_BASE_URL}/${path}/`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`)
  }

  return unwrapList<T>(await response.json())
}

async function loadApiObject<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}/${path}/`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`)
  }

  return response.json()
}

export const academicApi = {
  getCareers: () => loadApiList<Career>('careers'),
  getCareerStats: () => loadApiList<CareerStats>('career-stats'),
  getCourses: () => loadApiList<Course>('courses'),
  getCurriculum: () => loadApiList<Curriculum>('curriculum'),
  getStudents: () => loadApiList<Student>('students'),
  getSummary: () => loadApiObject<AcademicSummary>('summary'),
  getTeachers: () => loadApiList<Teacher>('teachers'),
}

export type AgentStreamEvent = {
  description?: string
  label?: string
  message?: string
  node?: string
  payload?: {
    text: string
  }
  status?: string
  tone?: string
  type?: string
}

type StreamAgentFlowOptions = {
  chatId?: number | null
  message: string
  onEvent: (eventName: string, event: AgentStreamEvent) => void
  signal?: AbortSignal
}

function parseSseChunk(buffer: string) {
  const blocks = buffer.split('\n\n')
  const remainder = blocks.pop() ?? ''

  return {
    events: blocks
      .map((block) => {
        const eventLine = block.split('\n').find((line) => line.startsWith('event:'))
        const dataLines = block
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.replace(/^data:\s?/, ''))

        if (dataLines.length === 0) return null

        return {
          data: dataLines.join('\n'),
          eventName: eventLine?.replace(/^event:\s?/, '') || 'message',
        }
      })
      .filter(Boolean) as Array<{ data: string; eventName: string }>,
    remainder,
  }
}

export async function streamAgentFlow({ chatId = null, message, onEvent, signal }: StreamAgentFlowOptions) {
  const response = await fetch(`${AGENT_API_BASE_URL}/flow/stream/`, {
    body: JSON.stringify({ chat_id: chatId ?? 0, message }),
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error('No se pudo iniciar el flujo IA en streaming.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let streamStep = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parsed = parseSseChunk(buffer)
    buffer = parsed.remainder

    parsed.events.forEach(({ data, eventName }) => {
      try {
        const event = JSON.parse(data) as AgentStreamEvent
        streamStep += 1
        console.log(`Paso ${streamStep} · ${eventName} · ${event.label ?? event.node ?? event.type ?? 'Evento'}`, event)
        onEvent(eventName, event)
      } catch {
        streamStep += 1
        console.log(`Paso ${streamStep} · ${eventName}`, data)
        onEvent(eventName, { message: data, type: eventName })
      }
    })
  }
}
