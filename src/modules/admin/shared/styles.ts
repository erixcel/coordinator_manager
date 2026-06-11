export const shell =
  'min-h-screen bg-white text-[#222222] font-[Inter,-apple-system,BlinkMacSystemFont,"Segoe_UI",Roboto,Helvetica,Arial,sans-serif]'

export const panel =
  'rounded-[12px] border border-[#EBEBEB] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'

export const iconButton =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EBEBEB] bg-white text-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
