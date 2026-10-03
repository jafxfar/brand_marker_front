type PermissionHolder = {
  platformRole: string
  permissions: string[]
} | null | undefined

/** Ordered like the sidebar: the first allowed entry is the landing page. */
export const ADMIN_ROUTE_PERMISSIONS: ReadonlyArray<{ href: string; permission: string }> = [
  { href: "/admin", permission: "admin_dashboard.view" },
  { href: "/admin/users", permission: "admin_users.view" },
  { href: "/admin/moderation", permission: "admin_reports.view" },
  { href: "/admin/companies", permission: "admin_companies.view" },
  { href: "/admin/verification", permission: "admin_companies.view" },
  { href: "/admin/catalog", permission: "admin_catalog.view" },
  { href: "/admin/categories", permission: "admin_catalog.view" },
  { href: "/admin/rfqs", permission: "admin_rfqs.view" },
  { href: "/admin/proposals", permission: "admin_proposals.view" },
  { href: "/admin/contracts", permission: "admin_contracts.view" },
  { href: "/admin/finance", permission: "admin_finance.view" },
  { href: "/admin/escrow", permission: "admin_finance.view" },
  { href: "/admin/disputes", permission: "admin_disputes.view" },
  { href: "/admin/analytics", permission: "admin_dashboard.view" },
  { href: "/admin/staff", permission: "admin_staff.view" },
  { href: "/admin/roles", permission: "roles.manage" },
  { href: "/admin/logs", permission: "audit_logs.view" },
  { href: "/admin/settings", permission: "platform_settings.view" },
]

export const hasPermission = (user: PermissionHolder, permission: string): boolean => {
  if (!user) return false
  if (user.platformRole === "superadmin") return true
  return user.permissions.includes(permission)
}

const matchesRoute = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

export const getAdminRoutePermission = (pathname: string): string | null => {
  const path = pathname.split(/[?#]/)[0]
  const match = ADMIN_ROUTE_PERMISSIONS
    .filter((route) => matchesRoute(path, route.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return match?.permission ?? null
}

export const canAccessAdminPath = (user: PermissionHolder, pathname: string): boolean => {
  const permission = getAdminRoutePermission(pathname)
  if (!permission) return true
  return hasPermission(user, permission)
}

export const STAFF_ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  moderator: "Модератор",
  superadmin: "Суперадминистратор",
}

export const getStaffRoleLabel = (roleName: string | null | undefined) =>
  roleName ? STAFF_ROLE_LABELS[roleName] ?? roleName : "Без роли"

const STAFF_RANK: Record<string, number> = { moderator: 1, admin: 2, superadmin: 3 }

const staffRoleRank = (roleName: string) => (roleName === "admin" ? 2 : 1)

/** Mirrors backend rules: only a strictly higher rank can manage a role or a staff member. */
export const canManageStaffRole = (user: PermissionHolder, roleName: string) => {
  if (!user) return false
  return (STAFF_RANK[user.platformRole] ?? 0) > staffRoleRank(roleName)
}

export const canManageStaffMember = (
  user: (PermissionHolder & { userId: number }) | null | undefined,
  member: { id: number; platform_role: string },
) => {
  if (!user || user.userId === member.id) return false
  return (STAFF_RANK[user.platformRole] ?? 0) > (STAFF_RANK[member.platform_role] ?? 0)
}

export const getFirstAllowedAdminPath = (user: PermissionHolder): string | null =>
  ADMIN_ROUTE_PERMISSIONS.find((route) => hasPermission(user, route.permission))?.href ?? null
