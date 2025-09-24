export interface BreadcrumbItem {
  id: string
  label: string
  href: string
  current: boolean
  icon?: React.ReactNode
  disabled?: boolean
  hidden?: boolean
  metadata?: Record<string, unknown>
}

export interface RouteMetadata {
  [key: string]: {
    label: string | ((pathname: string, params?: Record<string, string>) => string)
    icon?: React.ReactNode
    disabled?: boolean
    hidden?: boolean
    async?: boolean
    resolver?: (segment: string, context: RouteContext) => Promise<Partial<BreadcrumbItem>>
  }
}

export interface RouteContext {
  pathname: string
  segments: string[]
  index: number
  parent?: BreadcrumbItem
  params?: Record<string, string>
}

export interface CustomTranslations {
  home: string
  back: string
  details: string
  loading: string
  error: string
  [key: string]: string
}