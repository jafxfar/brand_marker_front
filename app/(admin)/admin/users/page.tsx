"use client"

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCcw,
  Search,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from "@/hooks/api/use-admin-users-query"
import { getApiErrorMessage } from "@/lib/api/client"
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
  AdminUserStatusFilter,
} from "@/lib/api/admin"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"
import { PageEmptyState, PageFrame, PageHeader, PageSurface, SegmentedControl } from "@/components/layout"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 20

const statusFilters: Array<{
  value: AdminUserStatusFilter
  label: string
}> = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "blocked", label: "Заблокированные" },
  { value: "pending", label: "Ожидают активации" },
]

const roleLabels: Record<AdminUserRole, string> = {
  buyer: "Заказчик",
  supplier: "Поставщик",
  both: "Заказчик и поставщик",
  admin: "Администратор",
  superadmin: "Суперадминистратор",
  moderator: "Модератор",
}

const statusMetadata: Record<
  AdminUserStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Активен",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  blocked: {
    label: "Заблокирован",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  pending: {
    label: "Ожидает активации",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
}

const staffRoleRank: Partial<Record<AdminUserRole, number>> = {
  moderator: 1,
  admin: 2,
  superadmin: 3,
}

const isStatusFilter = (value: string | null): value is AdminUserStatusFilter =>
  value === "all" ||
  value === "active" ||
  value === "blocked" ||
  value === "pending"

const formatRegistrationDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))

const getInitials = (user: AdminUser) => {
  const firstName = user.first_name.trim().charAt(0)
  const lastName = user.last_name.trim().charAt(0)
  return `${firstName}${lastName}`.toUpperCase() || user.email.charAt(0).toUpperCase()
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)
}

const UserStatusBadge = ({ status }: { status: AdminUserStatus }) => {
  const metadata = statusMetadata[status]
  return (
    <Badge variant="outline" className={metadata.className}>
      {metadata.label}
    </Badge>
  )
}

const UsersSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка пользователей">
    <div className="space-y-2">
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="h-4 w-80 max-w-full rounded bg-muted" />
    </div>
    <div className="h-12 rounded-xl bg-muted" />
    <div className="h-80 rounded-xl border border-border bg-card" />
  </PageFrame>
)

type UserActionButtonProps = {
  user: AdminUser
  canManage: boolean
  onSelect: (user: AdminUser) => void
}

const UserActionButton = ({
  user,
  canManage,
  onSelect,
}: UserActionButtonProps) => {
  if (!canManage) {
    return (
      <span className="text-xs text-muted-foreground" title="Недостаточно прав">
        Защищён
      </span>
    )
  }

  const isBlocked = user.status === "blocked"
  return (
    <Button
      type="button"
      variant={isBlocked ? "outline" : "ghost"}
      size="sm"
      onClick={() => onSelect(user)}
      className={cn(!isBlocked && "text-destructive hover:text-destructive")}
      aria-label={`${isBlocked ? "Разблокировать" : "Заблокировать"} ${user.email}`}
    >
      {isBlocked ? <UserCheck aria-hidden="true" /> : <Ban aria-hidden="true" />}
      {isBlocked ? "Разблокировать" : "Заблокировать"}
    </Button>
  )
}

const AdminUsersContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)
  const statusParam = searchParams.get("status")
  const status = isStatusFilter(statusParam) ? statusParam : "all"
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("query") ?? ""
  const [searchInput, setSearchInput] = useState(query)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const usersQuery = useAdminUsersQuery({
    page,
    pageSize: PAGE_SIZE,
    status,
    query,
  })
  const updateStatusMutation = useUpdateAdminUserStatusMutation()

  const replaceSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || (key === "status" && value === "all")) {
          nextParams.delete(key)
          return
        }
        nextParams.set(key, value)
      })
      const nextQuery = nextParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    if (searchInput === query) return
    const timeout = window.setTimeout(() => {
      replaceSearchParams({
        query: searchInput.trim() || null,
        page: null,
      })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [query, replaceSearchParams, searchInput])

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    if (!usersQuery.data || page <= usersQuery.data.pages) return
    replaceSearchParams({ page: String(usersQuery.data.pages) })
  }, [page, replaceSearchParams, usersQuery.data])

  const currentRoleRank =
    staffRoleRank[currentUser?.platformRole as AdminUserRole] ?? 0

  const canManageUser = (user: AdminUser) => {
    if (user.id === currentUser?.userId) return false
    const targetRoleRank = staffRoleRank[user.role] ?? 0
    return targetRoleRank === 0 || targetRoleRank < currentRoleRank
  }

  const handleStatusChange = (nextStatus: AdminUserStatusFilter) => {
    replaceSearchParams({
      status: nextStatus,
      page: null,
    })
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return
    const nextStatus: AdminUserStatus =
      selectedUser.status === "blocked" ? "active" : "blocked"

    try {
      await updateStatusMutation.mutateAsync({
        userId: selectedUser.id,
        status: nextStatus,
      })
      toast.success(
        nextStatus === "blocked"
          ? "Пользователь заблокирован"
          : "Пользователь разблокирован",
      )
      setSelectedUser(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось изменить статус пользователя"))
    }
  }

  const getPageHref = (targetPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (targetPage <= 1) {
      nextParams.delete("page")
    } else {
      nextParams.set("page", String(targetPage))
    }
    const nextQuery = nextParams.toString()
    return nextQuery ? `${pathname}?${nextQuery}` : pathname
  }

  const pageNumbers = useMemo(
    () => getPageNumbers(page, usersQuery.data?.pages ?? 1),
    [page, usersQuery.data?.pages],
  )

  if (usersQuery.isLoading) {
    return <UsersSkeleton />
  }

  if (usersQuery.isError || !usersQuery.data) {
    return (
      <div className="flex min-h-[55dvh] items-center justify-center">
        <div className="w-full max-w-lg rounded-xl border border-destructive/20 bg-card p-8 text-center">
          <Ban size={26} className="mx-auto text-destructive" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-foreground">
            Не удалось загрузить пользователей
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Проверьте подключение к API и повторите запрос.
          </p>
          <Button
            type="button"
            onClick={() => usersQuery.refetch()}
            className="mt-5"
          >
            <RefreshCcw aria-hidden="true" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const { items, status_counts: statusCounts, total, pages } = usersQuery.data
  const hasFilters = Boolean(query || status !== "all")

  return (
    <PageFrame>
      <PageHeader
        title="Пользователи"
        description="Управление доступом и статусами учётных записей"
        actions={
          <p className="text-sm text-muted-foreground">
            Найдено <strong className="ml-1 text-foreground">{total}</strong>
          </p>
        }
      />

      <PageSurface aria-label="Фильтры пользователей">
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Имя, email, телефон или ID"
              className="pl-11"
              aria-label="Поиск пользователей"
            />
          </div>
        </div>
        <div className="p-3">
          <SegmentedControl
            value={status}
            options={statusFilters.map((filter) => ({
              ...filter,
              count: statusCounts[filter.value],
            }))}
            onChange={handleStatusChange}
            ariaLabel="Статус пользователей"
            className="w-full max-w-full border-0 bg-transparent p-0"
          />
        </div>
      </PageSurface>

      {items.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            title={hasFilters ? "Пользователи не найдены" : "Пользователей пока нет"}
            description={
              hasFilters
                ? "Измените поисковый запрос или выбранный статус."
                : "Новые учётные записи появятся здесь после регистрации."
            }
          />
          {hasFilters && (
            <div className="flex justify-center pb-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("")
                  replaceSearchParams({ query: null, status: null, page: null })
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </PageSurface>
      ) : (
        <PageSurface
          className={cn(usersQuery.isFetching && "opacity-70")}
          aria-busy={usersQuery.isFetching}
        >
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/35 hover:bg-muted/35">
                  <TableHead className="px-5">Пользователь</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead className="px-5 text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">
                          {getInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-52 truncate font-bold text-foreground">
                            {`${user.first_name} ${user.last_name}`.trim() || "Без имени"}
                          </p>
                          <p className="text-xs text-muted-foreground">ID {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-60">
                        <p className="truncate text-sm text-foreground">{user.email}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {user.phone || "Телефон не указан"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge status={user.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRegistrationDate(user.created_at)}
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <UserActionButton
                        user={user}
                        canManage={canManageUser(user)}
                        onSelect={setSelectedUser}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {items.map((user) => (
              <li key={user.id} className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">
                    {getInitials(user)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground">
                      {`${user.first_name} ${user.last_name}`.trim() || "Без имени"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">ID {user.id}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                  <UserStatusBadge status={user.status} />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground">
                    <p>{user.phone || "Телефон не указан"}</p>
                    <p className="mt-0.5">{formatRegistrationDate(user.created_at)}</p>
                  </div>
                  <UserActionButton
                    user={user}
                    canManage={canManageUser(user)}
                    onSelect={setSelectedUser}
                  />
                </div>
              </li>
            ))}
          </ul>
        </PageSurface>
      )}

      {items.length > 0 && pages > 1 && (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Пагинация пользователей"
        >
          <Button variant="outline" size="sm" asChild={page > 1}>
            {page > 1 ? (
              <Link href={getPageHref(page - 1)}>
                <ChevronLeft aria-hidden="true" />
                Назад
              </Link>
            ) : (
              <span aria-disabled="true">
                <ChevronLeft aria-hidden="true" />
                Назад
              </span>
            )}
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {pageNumbers.map((pageNumber, index) => {
              const previousPage = pageNumbers[index - 1]
              return (
                <span key={pageNumber} className="flex items-center gap-1">
                  {previousPage && pageNumber - previousPage > 1 && (
                    <MoreHorizontal
                      size={16}
                      className="text-muted-foreground"
                      aria-label="Пропущенные страницы"
                    />
                  )}
                  <Button
                    variant={pageNumber === page ? "default" : "ghost"}
                    size="icon-sm"
                    asChild
                  >
                    <Link
                      href={getPageHref(pageNumber)}
                      aria-current={pageNumber === page ? "page" : undefined}
                    >
                      {pageNumber}
                    </Link>
                  </Button>
                </span>
              )
            })}
          </div>
          <span className="text-xs text-muted-foreground sm:hidden">
            {page} из {pages}
          </span>

          <Button variant="outline" size="sm" asChild={page < pages}>
            {page < pages ? (
              <Link href={getPageHref(page + 1)}>
                Далее
                <ChevronRight aria-hidden="true" />
              </Link>
            ) : (
              <span aria-disabled="true">
                Далее
                <ChevronRight aria-hidden="true" />
              </span>
            )}
          </Button>
        </nav>
      )}

      <AlertDialog
        open={Boolean(selectedUser)}
        onOpenChange={(open) => {
          if (!open && !updateStatusMutation.isPending) {
            setSelectedUser(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.status === "blocked"
                ? "Разблокировать пользователя?"
                : "Заблокировать пользователя?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === "blocked"
                ? `${selectedUser.email} снова сможет входить в систему и пользоваться платформой.`
                : `${selectedUser?.email ?? "Пользователь"} потеряет доступ к системе, включая уже активные сессии.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                handleConfirmStatusChange()
              }}
              disabled={updateStatusMutation.isPending}
              className={cn(
                selectedUser?.status !== "blocked" &&
                  "bg-destructive text-white hover:bg-destructive/90",
              )}
            >
              {updateStatusMutation.isPending
                ? "Сохранение..."
                : selectedUser?.status === "blocked"
                  ? "Разблокировать"
                  : "Заблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageFrame>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<UsersSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  )
}
