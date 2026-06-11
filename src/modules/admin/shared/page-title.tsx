export function PageTitle({ children }: { children: string }) {
  return (
    <h1 className="font-['Anton'] text-[28px] font-normal uppercase leading-none tracking-normal text-[#222222]">
      {children}
    </h1>
  )
}
