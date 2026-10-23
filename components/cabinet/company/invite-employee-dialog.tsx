"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BUYER_EMPLOYEE_ROLES,
  BUYER_ROLE_RIGHTS,
  type BuyerEmployee,
  type BuyerEmployeeRole,
} from "@/lib/mock/buyer-employees"

type InviteEmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (employee: BuyerEmployee) => void
}

export const InviteEmployeeDialog = ({
  open,
  onOpenChange,
  onInvite,
}: InviteEmployeeDialogProps) => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<BuyerEmployeeRole>("Закупщик")
  const [limit, setLimit] = useState("10000")
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  const reset = () => {
    setName("")
    setPhone("")
    setRole("Закупщик")
    setLimit("10000")
    setErrors({})
  }

  const handleSubmit = () => {
    const nextErrors: { name?: string; phone?: string } = {}
    const trimmed = name.trim()
    const digits = phone.replace(/\D/g, "")
    if (trimmed.length < 3) nextErrors.name = "Укажите имя"
    if (digits.length < 9) nextErrors.phone = "Укажите номер телефона"
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const limitNum = Number(limit)
    const employee: BuyerEmployee = {
      id: `e${Date.now()}`,
      name: trimmed,
      role,
      rights: BUYER_ROLE_RIGHTS[role],
      limit: Number.isFinite(limitNum) ? limitNum : 0,
      phone: `+992 ${digits.slice(-9).replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")}`,
      status: "invited",
    }
    onInvite(employee)
    toast.success("Приглашение отправлено по SMS")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Пригласить сотрудника</DialogTitle>
          <DialogDescription>
            Сотрудник получит SMS со ссылкой. Покупки дороже лимита уйдут вам на
            согласование.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-name">Имя и фамилия</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="text-[13.5px] font-medium text-red-600">{errors.name}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-phone">Телефон</Label>
            <Input
              id="invite-phone"
              inputMode="tel"
              placeholder="+992"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="tnum"
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? (
              <p className="text-[13.5px] font-medium text-red-600">{errors.phone}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="invite-role">Роль</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as BuyerEmployeeRole)}
                className="h-11 w-full rounded-[10px] border border-line bg-white px-3.5 text-[15px] outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
              >
                {BUYER_EMPLOYEE_ROLES.filter((r) => r !== "Наблюдатель").map(
                  (r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-limit">Лимит на сделку, TJS</Label>
              <Input
                id="invite-limit"
                type="number"
                min={0}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="tnum"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="button" variant="dark" onClick={handleSubmit}>
            Отправить приглашение
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
