"use client"

import { Loader2, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAdminLogQuery } from "@/hooks/api/use-admin-logs-query"
import {
  getLogFieldLabel,
  getLogUserRoleLabel,
  LOG_KIND_LABELS,
  LOG_SECTION_LABELS,
  LOG_STATUS_META,
} from "@/lib/admin-log-labels"

type LogDetailsSheetProps = {
  logId: number | null
  onClose: () => void
}

export const formatLogDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 wrap-break-word text-foreground">{children}</dd>
  </div>
)

export const LogDetailsSheet = ({ logId, onClose }: LogDetailsSheetProps) => {
  const logQuery = useAdminLogQuery(logId)
  const log = logQuery.data

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Sheet open={Boolean(logId)} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Подробности записи</SheetTitle>
          <SheetDescription>Кто, когда и что сделал на платформе</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          {logQuery.isLoading && (
            <div className="flex min-h-60 items-center justify-center text-muted-foreground">
              <Loader2 className="animate-spin" aria-label="Загрузка записи" />
            </div>
          )}

          {logQuery.isError && (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">Не удалось загрузить запись</p>
              <Button type="button" variant="outline" size="sm" onClick={() => logQuery.refetch()}>
                <RefreshCcw aria-hidden="true" />
                Повторить
              </Button>
            </div>
          )}

          {log && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <Badge variant="outline" className={LOG_STATUS_META[log.status].className}>
                  {LOG_STATUS_META[log.status].label}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {LOG_STATUS_META[log.status].hint}
                </p>
              </div>

              <dl className="divide-y divide-border">
                <DetailRow label="Когда">{formatLogDateTime(log.created_at)}</DetailRow>
                <DetailRow label="Кто">
                  {log.user ? (
                    <>
                      <p className="font-semibold">{log.user.name}</p>
                      <p className="text-muted-foreground">{log.user.email}</p>
                      <p className="text-muted-foreground">{getLogUserRoleLabel(log.user.role)}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">Гость</p>
                      {log.guest_email && (
                        <p className="text-muted-foreground">Указан email: {log.guest_email}</p>
                      )}
                    </>
                  )}
                </DetailRow>
                <DetailRow label="Действие">{LOG_KIND_LABELS[log.kind]}</DetailRow>
                <DetailRow label="Раздел">{LOG_SECTION_LABELS[log.section]}</DetailRow>
                <DetailRow label="Объект">{log.object_id ? `№ ${log.object_id}` : "—"}</DetailRow>
                <DetailRow label="IP-адрес">{log.ip_address || "—"}</DetailRow>
              </dl>

              <section aria-labelledby="log-fields-title">
                <h3 id="log-fields-title" className="text-sm font-bold text-foreground">
                  Переданные данные
                </h3>
                {log.fields.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Данные не передавались</p>
                ) : (
                  <dl className="mt-2 divide-y divide-border rounded-xl border border-border px-4">
                    {log.fields.map((field) => (
                      <DetailRow key={field.key} label={getLogFieldLabel(field.key)}>
                        {field.hidden ? (
                          <span className="text-muted-foreground italic">скрыто</span>
                        ) : (
                          field.value || "—"
                        )}
                      </DetailRow>
                    ))}
                  </dl>
                )}
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
