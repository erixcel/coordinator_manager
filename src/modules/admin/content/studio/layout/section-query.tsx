import { Loader2, Play, Sparkles } from 'lucide-react'

type SectionQueryProps = {
  isStreaming: boolean
  onPromptChange: (value: string) => void
  onStart: () => void
  prompt: string
}

export function SectionQuery({
  isStreaming,
  onPromptChange,
  onStart,
  prompt,
}: SectionQueryProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="relative p-6 lg:p-7">
        <div>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FF385C] to-[#FF6B81] text-white shadow-[0_8px_24px_rgba(255,56,92,0.25)]">
                <Sparkles size={21} strokeWidth={1.8} />
              </span>
              <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-slate-900">Studio IA</h1>
            </div>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#FF5A79] px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,0.25)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(255,56,92,0.35)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isStreaming || !prompt.trim()}
              onClick={onStart}
              type="button"
            >
              {isStreaming ? <Loader2 className="animate-spin" size={17} /> : <Play size={17} />}
              {isStreaming ? 'Creando propuesta' : 'Crear horario'}
            </button>
          </div>

          <label className="grid gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Intencion del administrador
            </span>
            <textarea
              className="min-h-[116px] resize-none rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#FF385C]/40 focus:shadow-[0_0_0_3px_rgba(255,56,92,0.08)]"
              onChange={(event) => onPromptChange(event.target.value)}
              value={prompt}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
