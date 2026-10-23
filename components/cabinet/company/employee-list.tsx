"use client"

import { useState } from "react"
import { Info, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/bm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  BUYER_EMPLOYEE_ROLES,
  formatEmployeeLimit,
  initialsFromName,
  type BuyerEmployee,
  type BuyerEmployeeRole,
} from "@/lib/mock/buyer-employees"

const STATUS_LABEL: Record<BuyerEmployee["status"], string> = {
  active: "Активен",
  invited: "Приглашён",
  blocked: "Заблокирован",
}

type EmployeeListProps = {
  employees: BuyerEmployee[]
  isBoss: boolean
  onChangeRole: (id: string, role: BuyerEmployeeRole) => void
  onChangeLimit: (id: string, limit: number) => void
  onRemove: (id: string) => void
}

export const EmployeeList = ({
  employees,
  isBoss,
  onChangeRole,
  onChangeLimit,
  onRemove,
}: EmployeeListProps) => {
  const [limitTarget, setLimitTarget] = useState<BuyerEmployee | null>(null)
  const [limitValue, setLimitValue] = useState("0")
  const [removeTarget, setRemoveTarget] = useState<BuyerEmployee | null>(null)

  const openLimit = (employee: BuyerEmployee) => {
    setLimitTarget(employee)
    setLimitValue(String(employee.limit ?? 0))
  }

  const saveLimit = () => {
    if (!limitTarget) return
    const v = Number(limitValue)
    if (!(v >= 0) || !Number.isFinite(v)) {
      toast.error("Укажите сумму")
      return
    }
    onChangeLimit(limitTarget.id, v)
    toast.success("Лимит сохранён")
    setLimitTarget(null)
  }

  const confirmRemove = () => {
    if (!removeTarget) return
    onRemove(removeTarget.id)
    toast.success(`${removeTarget.name} удалён(а), доступ закрыт`)
    setRemoveTarget(null)
  }

  return (
    <>
      {isBoss ? (
        <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 text-[14px]">
          <Info className="size-5 shrink-0 text-brand-700" aria-hidden />
          <span>
            Вы руководитель: можете менять роли, лимиты и удалять сотрудников.
            Все изменения записываются в историю ниже.
          </span>
        </div>
      ) : null}

      <div className="divide-y divide-line rounded-2xl border border-line bg-white">
        {employees.map((employee) => {
          const canEdit = isBoss && !employee.me
          return (
            <div
              key={employee.id}
              className="grid items-center gap-3 p-4 md:grid-cols-[minmax(0,1.2fr)_180px_minmax(0,1fr)_auto] md:gap-5 md:p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF0F3] text-[13px] font-bold">
                  {initialsFromName(employee.name)}
                </span>
                <div className="min-w-0">
                  <b className="text-[15px]">
                    {employee.name}
                    {employee.me ? (
                      <span className="text-[12.5px] font-normal text-mute">
                        {" "}
                        (вы)
                      </span>
                    ) : null}
                  </b>
                  <div className="tnum text-[13px] text-mute">{employee.phone}</div>
                </div>
              </div>

              <div>
                {canEdit ? (
                  <>
                    <label className="sr-only" htmlFor={`er-${employee.id}`}>
                      Роль
                    </label>
                    <select
                      id={`er-${employee.id}`}
                      value={employee.role}
                      onChange={(e) =>
                        onChangeRole(
                          employee.id,
                          e.target.value as BuyerEmployeeRole,
                        )
                      }
                      className="h-10 w-full rounded-[10px] border border-line bg-white px-3 text-[15px] outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
                    >
                      {BUYER_EMPLOYEE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <span className="text-[14.5px] font-semibold">
                    {employee.role}
                  </span>
                )}
              </div>

              <div className="text-[13.5px]">
                <span className="text-mute">{employee.rights}</span>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span>
                    Лимит:{" "}
                    <b className="tnum">{formatEmployeeLimit(employee.limit)}</b>
                  </span>
                  <span>·</span>
                  <StatusBadge
                    status={employee.status}
                    label={STATUS_LABEL[employee.status]}
                  />
                </div>
              </div>

              <div className="flex justify-start gap-2 md:justify-end">
                {canEdit ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => openLimit(employee)}
                    >
                      Лимит
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3 text-red-600 hover:text-red-700"
                      onClick={() => setRemoveTarget(employee)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Удалить
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog
        open={Boolean(limitTarget)}
        onOpenChange={(open) => !open && setLimitTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Лимит: {limitTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="emp-limit">Лимит на одну сделку, TJS</Label>
            <Input
              id="emp-limit"
              type="number"
              min={0}
              value={limitValue}
              onChange={(e) => setLimitValue(e.target.value)}
              className="tnum"
            />
            <p className="text-[13px] text-mute">
              0 — сотрудник не может покупать, только смотреть
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setLimitTarget(null)}>
              Отмена
            </Button>
            <Button type="button" variant="dark" onClick={saveLimit}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Удалить сотрудника?</DialogTitle>
          </DialogHeader>
          <p className="text-[14.5px] text-mute">
            {removeTarget
              ? `${removeTarget.name} потеряет доступ к кабинету компании.`
              : null}
          </p>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setRemoveTarget(null)}>
              Отмена
            </Button>
            <Button type="button" variant="destructive" onClick={confirmRemove}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
