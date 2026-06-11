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
    </div>
  )
}
