type CabinetShellProps = {
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
  mobileNav?: React.ReactNode
}

export const CabinetShell = ({
  sidebar,
  topbar,
  children,
  mobileNav,
}: CabinetShellProps) => {
  return (
    <div className="min-h-dvh bg-canvas pb-20 lg:pb-0">
      {topbar}
      <div className="mx-auto max-w-[1400px] lg:flex lg:gap-8 lg:px-8 lg:py-8">
        <aside className="hidden w-[240px] shrink-0 lg:block">
          <div className="sticky top-[92px]">{sidebar}</div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 lg:p-0">{children}</main>
      </div>
      {mobileNav}
    </div>
  )
}
