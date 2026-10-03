import type {
  AdminLogAudience,
  AdminLogKind,
  AdminLogPeriod,
  AdminLogSection,
  AdminLogStatus,
} from "@/lib/api/admin"

export const LOG_AUDIENCE_LABELS: Record<AdminLogAudience, string> = {
  users: "Пользователи",
  staff: "Сотрудники",
}

export const LOG_KIND_LABELS: Record<AdminLogKind, string> = {
  login: "Вход",
  register: "Регистрация",
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
  view: "Просмотр",
}

export const LOG_SECTION_LABELS: Record<AdminLogSection, string> = {
  auth: "Вход и аккаунт",
  rfqs: "Заявки",
  proposals: "Предложения",
  contracts: "Контракты",
  finance: "Финансы",
  catalog: "Каталог",
  companies: "Компании",
  staff: "Сотрудники",
  roles: "Роли и доступы",
  disputes: "Споры",
  reports: "Жалобы",
  reviews: "Отзывы",
  notifications: "Уведомления",
  subscription: "Подписка",
  users: "Пользователи",
  settings: "Настройки",
  other: "Прочее",
}

export const LOG_STATUS_META: Record<
  AdminLogStatus,
  { label: string; hint: string; className: string }
> = {
  success: {
    label: "Успешно",
    hint: "Запрос выполнен без ошибок",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  invalid: {
    label: "Ошибка в данных",
    hint: "Поля заполнены неверно или не полностью",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  unauthorized: {
    label: "Не выполнен вход",
    hint: "Неверный логин или пароль, либо сессия истекла",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  forbidden: {
    label: "Нет доступа",
    hint: "У пользователя нет прав на это действие",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  not_found: {
    label: "Не найдено",
    hint: "Запись не существует или была удалена",
    className: "border-border bg-muted text-muted-foreground",
  },
  conflict: {
    label: "Конфликт",
    hint: "Такая запись уже существует или её состояние изменилось",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  rate_limited: {
    label: "Слишком много попыток",
    hint: "Запросы временно ограничены, нужно подождать",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  rejected: {
    label: "Запрос отклонён",
    hint: "Система не приняла запрос",
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  server_error: {
    label: "Сбой на сервере",
    hint: "Внутренняя ошибка платформы, стоит сообщить разработчикам",
    className: "border-transparent bg-destructive text-white",
  },
}

export const LOG_PERIOD_LABELS: Record<AdminLogPeriod, string> = {
  "24h": "За сутки",
  "7d": "За 7 дней",
  "30d": "За 30 дней",
  all: "За всё время",
}

const USER_ROLE_LABELS: Record<string, string> = {
  buyer: "Заказчик",
  supplier: "Исполнитель",
  both: "Заказчик и исполнитель",
  admin: "Администратор",
  moderator: "Модератор",
  superadmin: "Суперадминистратор",
}

export const getLogUserRoleLabel = (role: string) => USER_ROLE_LABELS[role] ?? role

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Пароль",
  first_name: "Имя",
  last_name: "Фамилия",
  phone: "Телефон",
  role: "Роль",
  role_id: "Роль (номер)",
  status: "Статус",
  action: "Действие",
  reason: "Причина",
  title: "Название",
  name: "Название",
  description: "Описание",
  message: "Сообщение",
  comment: "Комментарий",
  note: "Примечание",
  price: "Цена",
  amount: "Сумма",
  currency: "Валюта",
  deadline: "Срок",
  delivery_time: "Срок выполнения",
  type: "Тип",
  category_id: "Категория",
  company_id: "Компания",
  slug: "Адрес (slug)",
  parent_id: "Родительская категория",
  permission_ids: "Права",
  payment_type: "Тип оплаты",
  visibility: "Видимость",
  budget_type: "Тип бюджета",
  file_names: "Файлы",
}

export const getLogFieldLabel = (key: string) => FIELD_LABELS[key] ?? key
