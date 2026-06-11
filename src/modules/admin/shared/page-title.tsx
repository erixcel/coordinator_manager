export function PageTitle({ children }: { children: string }) {
  return (
    <h1 className="text-2xl font-extrabold leading-none tracking-tight text-slate-900">
      {children}
    </h1>
  )
}
