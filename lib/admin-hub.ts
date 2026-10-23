export type AdminHubTabOption<T extends string> = {
  value: T
  label: string
  permission?: string
}

export const pickHubTab = <T extends string>(
  raw: string | null,
  options: readonly AdminHubTabOption<T>[],
  can: (permission: string) => boolean,
): T => {
  const allowed = options.filter((option) => !option.permission || can(option.permission))
  if (allowed.length === 0) return options[0].value
  const match = allowed.find((option) => option.value === raw)
  return match?.value ?? allowed[0].value
}
