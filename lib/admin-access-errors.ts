import { getApiErrorMessage } from "@/lib/api/client"

const ACCESS_ERROR_MESSAGES: Record<string, string> = {
  "Insufficient permissions": "Недостаточно прав",
  "You cannot grant permissions you do not have": "Нельзя выдать права, которых нет у вас",
  "You cannot manage this role": "Недостаточно прав для управления этой ролью",
  "You cannot change your own role matrix": "Нельзя изменить права собственной роли",
  "You cannot change your own staff account": "Нельзя изменить собственную учётную запись",
  "You cannot change this staff account":
    "Нельзя изменить сотрудника с такой же или более высокой ролью",
  "System role cannot be renamed": "Системную роль нельзя переименовать",
  "System role cannot be deactivated": "Системную роль нельзя отключить",
  "System role cannot be deleted": "Системную роль нельзя удалить",
  "Role is assigned to users": "Роль назначена сотрудникам — сначала смените им роль",
  "Role already exists": "Роль с таким названием уже существует",
  "This role name is reserved": "Это название зарезервировано",
  "Role not found": "Роль не найдена",
  "Staff user not found": "Сотрудник не найден",
  "Email already registered": "Пользователь с таким email уже существует",
  "Unknown or non-staff permission": "Выбраны недопустимые права",
}

export const getAdminAccessErrorMessage = (error: unknown, fallback: string) => {
  const message = getApiErrorMessage(error, fallback)
  return ACCESS_ERROR_MESSAGES[message] ?? message
}
