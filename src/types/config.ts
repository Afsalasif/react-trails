export interface BreadcrumbEngineConfig {
  locales: string[]
  restrictedRoutes: string[]
  staticRoutes: string[]
  maxSlugLength: number
  dynamicPatterns: RegExp[]
  enableCache: boolean
}

export interface AnimationConfig {
  enabled: boolean
  duration: number
  type: 'fade' | 'slide' | 'scale' | 'bounce' | 'none'
  easing?: string
  stagger?: number
}

export interface StyleConfig {
  container?: string
  list?: string
  item?: string
  current?: string
  disabled?: string
  separator?: string
  mobile?: {
    container?: string
    backButton?: string
    current?: string
  }
}

export interface AccessibilityConfig {
  announceChanges: boolean
  keyboardNavigation: boolean
  ariaLabels: {
    navigation: string
    current: string
    back: string
    separator: string
  }
}