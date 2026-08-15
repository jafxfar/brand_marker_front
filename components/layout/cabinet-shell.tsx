type CabinetShellProps = {
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
}

export const CabinetShell = ({ sidebar, topbar, children }: CabinetShellProps) => {
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 border-r border-border lg:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
