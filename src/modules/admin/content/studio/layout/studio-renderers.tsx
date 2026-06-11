import { Check, Clipboard, Sparkles } from 'lucide-react'
import { useState, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../../shared/styles'

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean
}

function MarkdownCode({ children, className, inline, ...props }: CodeProps) {
  const [copied, setCopied] = useState(false)
  const code = String(children ?? '').replace(/\n$/, '')
  const language = className?.replace('language-', '')
  const isBlock = Boolean(className) || code.includes('\n')

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  if (inline || !isBlock) {
    return (
      <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] font-semibold text-slate-700" {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-[#0F172A]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {language || 'code'}
        </span>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
          onClick={handleCopy}
          type="button"
        >
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="max-h-[360px] overflow-auto p-4 text-xs leading-6 text-slate-200">
        <code className={className} {...props}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownResult({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm font-medium text-slate-400">Este paso aun no tiene un resultado visible.</p>
  }

  return (
    <div className="grid gap-4 text-sm leading-6 text-slate-500">
      <ReactMarkdown
        urlTransform={(url) => url}
        components={{
          a: ({ children, ...props }) => (
            <a className="font-bold text-[#FF385C] underline-offset-4 hover:underline" rel="noreferrer" target="_blank" {...props}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rounded-r-xl border-l-4 border-[#FF385C] bg-rose-50/50 px-4 py-3 font-medium text-slate-600">
              {children}
            </blockquote>
          ),
          code: MarkdownCode,
          h1: ({ children }) => <h1 className="text-2xl font-extrabold leading-tight text-slate-800">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-extrabold leading-tight text-slate-800">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold leading-tight text-slate-800">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-bold leading-tight text-slate-800">{children}</h4>,
          img: ({ alt, ...props }) => (
            <img
              alt={alt ?? ''}
              className="max-h-[420px] w-auto max-w-full rounded-xl border border-slate-200/60 bg-white object-contain shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              loading="lazy"
              {...props}
            />
          ),
          li: ({ children }) => <li className="pl-1 font-medium text-slate-600">{children}</li>,
          ol: ({ children }) => <ol className="grid list-decimal gap-2 pl-5">{children}</ol>,
          p: ({ children }) => <p className="font-medium text-slate-600">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-slate-700">{children}</strong>,
          table: ({ children }) => (
            <div className="overflow-hidden rounded-xl border border-slate-200/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">{children}</table>
              </div>
            </div>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          td: ({ children }) => <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-600">{children}</td>,
          th: ({ children }) => <th className="border-b border-slate-200/60 px-4 py-3">{children}</th>,
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-slate-50/80 to-slate-100/40 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              {children}
            </thead>
          ),
          tr: ({ children }) => <tr className="last:[&_td]:border-0">{children}</tr>,
          ul: ({ children }) => <ul className="grid list-disc gap-2 pl-5 marker:text-[#FF385C]">{children}</ul>,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export function NeuralActivity({ active }: { active: boolean }) {
  return (
    <div className="relative grid min-h-[92px] place-items-center overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/90 to-slate-50/60 px-3 py-3 backdrop-blur">
      <div className="grid justify-items-center gap-2">
        <div className="relative grid h-14 w-14 place-items-center">
          <span className="absolute h-14 w-14 rounded-full border border-slate-200" />
          <span className="absolute h-10 w-10 rounded-full border border-dashed border-[#FF385C]/30" />
          <span className="absolute h-8 w-8 rounded-full bg-[#FF385C]/10 blur-md" />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#FF385C] to-[#FF6B81] text-white shadow-[0_8px_20px_rgba(255,56,92,0.25)]">
            <Sparkles size={15} />
          </span>
          <span className={cn('absolute h-14 w-14 rounded-full', active && 'animate-[spin_1.8s_linear_infinite]')}>
            <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-[#0F172A]" />
          </span>
          <span className={cn('absolute h-14 w-14 rounded-full', active && 'animate-[spin_2.6s_linear_infinite_reverse]')}>
            <span className="absolute bottom-1.5 left-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
          </span>
          <span className={cn('absolute h-10 w-10 rounded-full', active && 'animate-[spin_1.35s_linear_infinite]')}>
            <span className="absolute bottom-0 right-1 h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
          </span>
        </div>
        <span className="text-center text-xs font-bold text-slate-500">
          {active ? 'Pensando una propuesta' : 'Preparado'}
        </span>
      </div>
    </div>
  )
}
