import { Bot, Check, RefreshCw, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { agentBotApi, type AgentBotConfig } from '../../../../data'
import { cn, iconButton, panel } from '../../shared/styles'

export function AgentePage() {
  const [agent, setAgent] = useState<AgentBotConfig | null>(null)
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    void loadAgent()
  }, [])

  async function loadAgent() {
    setIsLoading(true)
    setError('')
    setSaved(false)

    try {
      const data = await agentBotApi.get()
      setAgent(data)
      setPrompt(data.prompt)
      setEnabled(data.enabled)
    } catch {
      setError('No se pudo cargar la configuracion del agente.')
    } finally {
      setIsLoading(false)
    }
  }

  async function saveAgent() {
    if (!prompt.trim() || isSaving) return

    setIsSaving(true)
    setError('')
    setSaved(false)

    try {
      const data = await agentBotApi.update({ enabled, prompt: prompt.trim() })
      setAgent(data)
      setPrompt(data.prompt)
      setEnabled(data.enabled)
      setSaved(true)
    } catch {
      setError('No se pudo guardar el system prompt del agente.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = Boolean(agent && (agent.prompt !== prompt || agent.enabled !== enabled))

  return (
    <section className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black leading-tight text-[#152033]">Agente</h1>
          <p className="mt-1 text-sm font-semibold text-[#6B7A90]">
            System prompt principal del orquestador IA.
          </p>
        </div>
        <button aria-label="Recargar agente" className={iconButton} onClick={loadAgent} type="button">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
      {saved && <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Prompt actualizado correctamente.</div>}

      <div className={cn(panel, 'overflow-hidden rounded-[8px]')}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBEBEB] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border border-[#FFE1E8] bg-[#FFF5F7] text-[#FF385C]">
              <Bot size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-[#152033]">
                {agent?.name ?? 'Asistente de Matricula UTP'}
              </h2>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#8EA0B8]">
                {agent?.model ?? 'gemini'}
              </p>
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E7EDF5] px-3 py-2 text-sm font-bold text-[#344054]">
            <input
              checked={enabled}
              className="h-4 w-4 accent-[#FF385C]"
              disabled={isLoading}
              onChange={(event) => setEnabled(event.target.checked)}
              type="checkbox"
            />
            Activo
          </label>
        </div>

        <div className="grid gap-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#6B7A90]">
            <ShieldCheck size={17} />
            <span>Este texto se usa como system prompt cada vez que el agente inicia o continúa un flujo.</span>
          </div>

          <textarea
            className="min-h-[520px] w-full resize-y rounded-[8px] border border-[#DCE5F2] bg-[#FBFCFE] p-4 font-mono text-sm leading-6 text-[#152033] outline-none transition focus:border-[#FF385C] focus:bg-white focus:ring-4 focus:ring-[#FF385C]/10 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isSaving}
            onChange={(event) => {
              setPrompt(event.target.value)
              setSaved(false)
            }}
            placeholder="Escribe el system prompt del agente..."
            spellCheck={false}
            value={prompt}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EBEBEB] pt-4">
            <p className="text-xs font-semibold text-[#8EA0B8]">
              {prompt.length.toLocaleString('es-PE')} caracteres
            </p>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#FF385C] px-4 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,56,92,0.22)] transition hover:bg-[#E33151] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:shadow-none"
              disabled={isLoading || isSaving || !prompt.trim() || !hasChanges}
              onClick={saveAgent}
              type="button"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={17} /> : saved ? <Check size={17} /> : <Save size={17} />}
              Guardar prompt
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
