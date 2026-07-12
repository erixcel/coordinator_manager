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
  account_email?: string
  account_username?: string
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

export type StudentContext = {
  account: {
    email: string
    first_name: string
    id: number
    last_name: string
    role: AuthRole
    student_id: number | null
  }
  alerts: Array<{
    level: 'info' | 'warning' | 'error'
    message: string
    title: string
  }>
  courses: Array<{
    codigo: string
    creditos: number
    curso_id: number
    horas_semanales: number
    nombre: string
  }>
  enrollment: {
    course_count: number
    label: string
    proposal_id: number | null
    status: string
    summary: string
    total_credits: number
  }
  next_step: string
  profile_completed: boolean
  student: {
    apellidos: string
    carrera: string
    carrera_id: number
    ciclo_actual: number | null
    codigo: string
    estudiante_id: number
    nombres: string
    turno_preferido: string
  } | null
}

export type StudentScheduleProposal = {
  has_proposal: boolean
  message: string
  proposal: {
    accepted_at: string | null
    algoritmo: string
    carrera: string
    ciclo: number
    created_at: string
    estado: string
    estado_label: string
    fitness_score: number
    metaheuristica: string
    modelo_aprendizaje: string
    propuesta_id: number
    total_cursos: number
    total_estudiantes: number
    total_secciones: number
  } | null
  proposals: Array<{
    created_at: string
    estado: string
    estado_label: string
    fitness_score: number
    metaheuristica: string
    propuesta_id: number
    total_cursos: number
    total_secciones: number
  }>
  schedule: Array<{
    aula: string
    bloque: string
    curso: string
    curso_id: number
    dia: string
    docente: string
    modalidad: string
    seccion: number
    turno: string
  }>
  sections: Array<{
    cantidad_estudiantes: number
    seccion: number
    turno_preferido: string
  }>
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000'
const API_ROOT_URL = rawApiBaseUrl.replace(/\/api\/academic$/, '').replace(/\/api$/, '')
const API_BASE_URL = `${API_ROOT_URL}/api/academic`
const AGENT_API_BASE_URL = `${API_ROOT_URL}/api/agent`
const AUTH_API_BASE_URL = `${API_ROOT_URL}/api/auth`
export const AUTH_STORAGE_KEY = 'coordinator-manager-admin'

export type AuthRole = 'admin' | 'student' | ''

export type AuthUser = {
  email: string
  first_name: string
  id: number
  is_staff: boolean
  last_name: string
  role: AuthRole
  student_id: number | null
  username: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type RegisterStudentInput = {
  confirmPassword: string
  email: string
  firstName: string
  lastName: string
  password: string
}

type PaginatedResponse<T> = {
  results: T[]
}

function unwrapList<T>(payload: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results
}

function getStoredAuthSession(): Partial<AuthSession> | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as { state?: Partial<AuthSession> }
    return parsed.state ?? null
  } catch {
    return null
  }
}

function updateStoredAuthTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw) as { state?: Record<string, unknown>; version?: number }
    const currentState = parsed.state ?? {}
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        ...parsed,
        state: {
          ...currentState,
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
        },
      }),
    )
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

async function refreshAccessToken() {
  const session = getStoredAuthSession()
  if (!session?.refreshToken) {
    throw new Error('La sesion expiro. Vuelve a iniciar sesion.')
  }

  const response = await fetch(`${AUTH_API_BASE_URL}/token/refresh/`, {
    body: JSON.stringify({ refresh: session.refreshToken }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('La sesion expiro. Vuelve a iniciar sesion.')
  }

  const payload = await response.json() as { access: string; refresh?: string }
  updateStoredAuthTokens(payload.access, payload.refresh)
  return payload.access
}

function withAuthHeaders(headers?: HeadersInit, accessToken?: string) {
  const nextHeaders = new Headers(headers)
  const token = accessToken ?? getStoredAuthSession()?.accessToken

  if (token) {
    nextHeaders.set('Authorization', `Bearer ${token}`)
  }

  return nextHeaders
}

async function fetchWithAuth(url: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: withAuthHeaders(options.headers),
  })

  if (response.status !== 401 || !retry) {
    return response
  }

  const accessToken = await refreshAccessToken()
  return fetch(url, {
    ...options,
    headers: withAuthHeaders(options.headers, accessToken),
  })
}

async function loadApiList<T>(path: string): Promise<T[]> {
  const url = `${API_BASE_URL}/${path}/?all=true`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`)
  }

  return unwrapList<T>(await response.json())
}

async function loadApiObject<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}/${path}${path.includes('?') ? '' : '/'}`
  const response = await fetchWithAuth(url)

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
  getStudentContext: () => loadApiObject<StudentContext>('student/context'),
  getStudentScheduleProposal: (proposalId?: number) =>
    loadApiObject<StudentScheduleProposal>(
      proposalId ? `student/schedule-proposal?proposal_id=${proposalId}` : 'student/schedule-proposal',
    ),
  getStudents: () => loadApiList<Student>('students'),
  getSummary: () => loadApiObject<AcademicSummary>('summary'),
  getTeachers: () => loadApiList<Teacher>('teachers'),
  async linkStudentAccount(payload: { email: string; estudianteId: number }) {
    const response = await fetchWithAuth(`${API_BASE_URL}/students/link-account/`, {
      body: JSON.stringify({
        email: payload.email,
        estudiante_id: payload.estudianteId,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null) as Record<string, string[] | string> | null
      const firstError = data
        ? Object.values(data).flatMap((value) => (Array.isArray(value) ? value : [value])).find(Boolean)
        : null

      throw new Error(typeof firstError === 'string' ? firstError : 'No se pudo vincular la cuenta.')
    }

    return response.json() as Promise<{ message: string; student: Student }>
  },
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    const response = await fetch(`${AUTH_API_BASE_URL}/token/`, {
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { detail?: string; non_field_errors?: string[] } | null
      throw new Error(payload?.detail ?? payload?.non_field_errors?.[0] ?? 'Correo o contrasena incorrectos.')
    }

    const payload = await response.json() as { access: string; refresh: string; user: AuthUser }
    return {
      accessToken: payload.access,
      refreshToken: payload.refresh,
      user: payload.user,
    }
  },
  async me(): Promise<AuthUser> {
    const response = await fetchWithAuth(`${AUTH_API_BASE_URL}/me/`)

    if (!response.ok) {
      throw new Error('No se pudo validar la sesion actual.')
    }

    return response.json()
  },
  async registerStudent(input: RegisterStudentInput): Promise<{ message: string; user: AuthUser }> {
    const response = await fetch(`${AUTH_API_BASE_URL}/register/`, {
      body: JSON.stringify({
        confirm_password: input.confirmPassword,
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        password: input.password,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as Record<string, string[] | string> | null
      const firstError = payload
        ? Object.values(payload).flatMap((value) => (Array.isArray(value) ? value : [value])).find(Boolean)
        : null

      throw new Error(typeof firstError === 'string' ? firstError : 'No se pudo completar el registro.')
    }

    return response.json()
  },
}

export type AgentStreamEvent = {
  description?: string
  label?: string
  message?: string
  node?: string
  phase?: 'request' | 'response'
  payload?: {
    text: string
  }
  status?: string
  tone?: string
  tool_args?: Record<string, unknown>
  tool_call_id?: string
  tool_name?: string
  type?: string
}

export type AgentStudioRunRecord = {
  answer: string
  createdAt: string
  events: unknown[]
  id: string
  prompt: string
  selectedEventId: string | null
  status: 'completed' | 'error'
}

export type AgentBotConfig = {
  createdAt: string
  enabled: boolean
  id: number
  model: string
  name: string
  prompt: string
  updatedAt: string
}

type StreamAgentFlowOptions = {
  chatId?: number | null
  message: string
  onEvent: (eventName: string, event: AgentStreamEvent) => void
  signal?: AbortSignal
}

async function loadAgentObject<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetchWithAuth(`${AGENT_API_BASE_URL}/${path}`, options)

  if (!response.ok) {
    throw new Error(`No se pudo completar la solicitud ${path}`)
  }

  return response.json()
}

export const agentBotApi = {
  get: () => loadAgentObject<AgentBotConfig>('bot/'),
  update: (payload: Pick<AgentBotConfig, 'enabled' | 'prompt'>) =>
    loadAgentObject<AgentBotConfig>('bot/update/', {
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
    }),
}

export const agentStudioHistoryApi = {
  clear: async () => {
    const response = await fetchWithAuth(`${AGENT_API_BASE_URL}/studio-runs/clear/`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('No se pudo limpiar el historial de Studio IA.')
    }
  },
  create: (run: Omit<AgentStudioRunRecord, 'createdAt' | 'id'>) =>
    loadAgentObject<AgentStudioRunRecord>('studio-runs/create/', {
      body: JSON.stringify(run),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }),
  get: (id: string) => loadAgentObject<AgentStudioRunRecord>(`studio-runs/${id}/`),
  list: () => loadAgentObject<AgentStudioRunRecord[]>('studio-runs/?limit=100'),
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
  const response = await fetchWithAuth(`${AGENT_API_BASE_URL}/flow/stream/`, {
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
