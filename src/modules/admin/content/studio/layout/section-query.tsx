import { useState } from 'react'
import { Loader2, Play, Sparkles, HelpCircle, X } from 'lucide-react'

type SectionQueryProps = {
  isStreaming: boolean
  onPromptChange: (value: string) => void
  onStart: () => void
  prompt: string
}

const PROMPT_CATEGORIES = [
  {
    title: "📅 Planificación de Horarios",
    items: [
      {
        text: "Quiero crear horarios para los estudiantes de decimo ciclo de ingenieria de software",
        description: "Ejecuta el flujo completo (carrera, demanda, estudiantes, docentes, k-NNs) y optimiza el horario."
      },
      {
        text: "Quiero crear un preview de horario para Ingenieria de Software ciclo 10 pero únicamente para el turno de la mañana",
        description: "Planifica el horario de la cohorte restringiendo las clases al turno de la mañana."
      }
    ]
  },
  {
    title: "🔍 Predicción de Riesgo Estudiantil (k-NN)",
    items: [
      {
        text: "Analiza el riesgo de deserción y rendimiento academico usando k-NN para los estudiantes de decimo ciclo de ingenieria de software",
        description: "Clasifica a los estudiantes en niveles de riesgo y grafica las fronteras de decisión 2D."
      }
    ]
  },
  {
    title: "🎯 Recomendación de Cursos Electivos (k-NN)",
    items: [
      {
        text: "Recomenda los cursos electivos ideales para los estudiantes de decimo ciclo de ingenieria de software usando Vecinos mas Cercanos",
        description: "Sugiere asignaturas optativas óptimas para cada alumno y muestra un gráfico de distribución."
      }
    ]
  },
  {
    title: "📊 Consultas de Demanda y Profesores",
    items: [
      {
        text: "¿Cuáles son los cursos con mayor demanda en Ingeniería de Software ciclo 10?",
        description: "Obtiene los porcentajes de alumnos matriculables pendientes para cada curso."
      },
      {
        text: "Muestra la lista de docentes disponibles y calificados junto con sus días y horas para los cursos del ciclo 10 de Software",
        description: "Consulta y despliega la disponibilidad horaria del cuerpo docente habilitado."
      }
    ]
  }
]

export function SectionQuery({
  isStreaming,
  onPromptChange,
  onStart,
  prompt,
}: SectionQueryProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-[#EBEBEB] bg-white text-[#152033] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="relative p-6 lg:p-7">
        <div>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[8px] border border-[#DCE5F2] bg-white text-[#FF385C] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                <Sparkles size={21} />
              </span>
              <h1 className="text-[32px] font-black leading-none tracking-normal text-[#101828]">STUDIO IA</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#DCE5F2] bg-white text-[#5D6B82] shadow-sm transition hover:bg-[#F8FAFC] hover:text-[#152033] hover:border-[#C8D6E8] cursor-pointer"
                onClick={() => setIsHelpOpen(true)}
                type="button"
                title="Ejemplos de Prompt"
                aria-label="Ejemplos de Prompt"
              >
                <HelpCircle size={19} />
              </button>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#FF385C] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,56,92,0.24)] transition hover:bg-[#F72C52] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isStreaming || !prompt.trim()}
                onClick={onStart}
                type="button"
              >
                {isStreaming ? <Loader2 className="animate-spin" size={17} /> : <Play size={17} />}
                {isStreaming ? 'Creando propuesta' : 'Crear horario'}
              </button>
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#718096]">
              Intencion del administrador
            </span>
            <textarea
              className="min-h-[116px] resize-none rounded-[8px] border border-[#DCE5F2] bg-white px-4 py-3 text-[15px] font-medium leading-6 text-[#152033] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF385C] focus:ring-4 focus:ring-[#FF385C]/10"
              onChange={(event) => onPromptChange(event.target.value)}
              value={prompt}
            />
          </label>
        </div>
      </div>

      {/* Modal de Ayuda con Ejemplos */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E7EDF5] w-full max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E7EDF5] px-6 py-4">
              <div>
                <h3 className="text-lg font-black text-[#152033]">💡 Ejemplos de Prompt</h3>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)} 
                className="text-[#8EA0B8] hover:text-[#152033] transition rounded-lg p-1 hover:bg-[#F1F5F9]"
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto p-6 flex-1 grid gap-5">
              {PROMPT_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="grid gap-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.1em] text-[#8EA0B8]">{cat.title}</h4>
                  <div className="grid gap-2">
                    {cat.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          onPromptChange(item.text)
                          setIsHelpOpen(false)
                        }}
                        className="w-full text-left p-3 rounded-lg border border-[#E7EDF5] hover:border-[#FF385C] hover:bg-[#FFF5F7]/25 transition group cursor-pointer"
                        type="button"
                      >
                        <span className="text-xs font-bold text-[#344054] group-hover:text-[#FF385C] transition leading-normal block">
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-[#E7EDF5] bg-[#F8FAFC]/50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="h-9 rounded-[8px] border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#5D6B82] transition hover:bg-[#F8FAFC] cursor-pointer"
                type="button"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
