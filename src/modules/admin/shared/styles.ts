export const shell =
  "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/80 text-slate-900 font-['Inter',-apple-system,BlinkMacSystemFont,\"Segoe_UI\",Roboto,Helvetica,Arial,sans-serif]"

export const panel =
  'rounded-[16px] border border-slate-200/60 bg-white/72 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]'

export const iconButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/60 bg-white/80 backdrop-blur text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] active:scale-95'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
