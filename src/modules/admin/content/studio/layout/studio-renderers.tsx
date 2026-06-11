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
      <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[0.92em] font-bold text-[#344054]" {...props}>
        {children}
      </code>
    )
  }

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#E7EDF5] bg-[#0F172A]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-300">
          {language || 'code'}
        </span>
        <button
          className="inline-flex items-center gap-1.5 rounded-[6px] border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-white/10"
          onClick={handleCopy}
          type="button"
        >
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="max-h-[360px] overflow-auto p-4 text-xs leading-6 text-slate-100">
        <code className={className} {...props}>
          {code}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownResult({ text }: { text: string }) {
  if (!text.trim()) {
    return <p className="text-sm font-semibold text-[#8EA0B8]">Este paso aun no tiene un resultado visible.</p>
  }

  return (
    <div className="grid gap-4 text-sm leading-6 text-[#5D6B82]">
      <ReactMarkdown
        urlTransform={(url) => url}
        components={{
          a: ({ children, ...props }) => (
            <a className="font-black text-[#FF385C] underline-offset-4 hover:underline" rel="noreferrer" target="_blank" {...props}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rounded-r-[8px] border-l-4 border-[#FF385C] bg-[#FFF5F7] px-4 py-3 font-semibold text-[#5D6B82]">
              {children}
            </blockquote>
          ),
          code: MarkdownCode,
          h1: ({ children }) => <h1 className="text-2xl font-black leading-tight text-[#152033]">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-black leading-tight text-[#152033]">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-black leading-tight text-[#152033]">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-black leading-tight text-[#152033]">{children}</h4>,
          img: ({ alt, ...props }) => (
            <img
              alt={alt ?? ''}
              className="max-h-[420px] w-auto max-w-full rounded-[8px] border border-[#E7EDF5] bg-white object-contain shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              loading="lazy"
              {...props}
            />
          ),
          li: ({ children }) => <li className="pl-1 font-semibold text-[#5D6B82]">{children}</li>,
          ol: ({ children }) => <ol className="grid list-decimal gap-2 pl-5">{children}</ol>,
          p: ({ children }) => <p className="font-semibold text-[#5D6B82]">{children}</p>,
          strong: ({ children }) => <strong className="font-black text-[#344054]">{children}</strong>,
          table: ({ children }) => (
            <div className="overflow-hidden rounded-[8px] border border-[#E7EDF5]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left text-sm">{children}</table>
              </div>
            </div>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          td: ({ children }) => <td className="border-b border-[#EEF2F7] px-4 py-3 font-semibold text-[#344054]">{children}</td>,
          th: ({ children }) => <th className="border-b border-[#E7EDF5] px-4 py-3">{children}</th>,
          thead: ({ children }) => (
            <thead className="bg-[#F7F9FC] text-[11px] font-black uppercase tracking-[0.1em] text-[#8EA0B8]">
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
    <div className="relative grid min-h-[92px] place-items-center overflow-hidden rounded-[8px] border border-[#E7EDF5] bg-gradient-to-br from-white to-[#F6F9FD] px-3 py-3">
      <div className="grid justify-items-center gap-2">
        <div className="relative grid h-14 w-14 place-items-center">
          <span className="absolute h-14 w-14 rounded-full border border-[#DCE5F2]" />
          <span className="absolute h-10 w-10 rounded-full border border-dashed border-[#FF385C]/40" />
          <span className="absolute h-8 w-8 rounded-full bg-[#FF385C]/10 blur-md" />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#FF385C] text-white shadow-[0_10px_20px_rgba(255,56,92,0.22)]">
            <Sparkles size={15} />
          </span>
          <span className={cn('absolute h-14 w-14 rounded-full', active && 'animate-[spin_1.8s_linear_infinite]')}>
            <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-[#0F172A]" />
          </span>
          <span className={cn('absolute h-14 w-14 rounded-full', active && 'animate-[spin_2.6s_linear_infinite_reverse]')}>
            <span className="absolute bottom-1.5 left-2 h-1.5 w-1.5 rounded-full bg-[#8EA0B8]" />
          </span>
          <span className={cn('absolute h-10 w-10 rounded-full', active && 'animate-[spin_1.35s_linear_infinite]')}>
            <span className="absolute bottom-0 right-1 h-1.5 w-1.5 rounded-full bg-[#FF385C]" />
          </span>
        </div>
        <span className="text-center text-xs font-black text-[#5D6B82]">
          {active ? 'Pensando una propuesta' : 'Preparado'}
        </span>
      </div>
    </div>
  )
}
