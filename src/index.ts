// Main components
export { DynamicBreadcrumb, MobileDynamicBreadcrumb } from './components'
export type { DynamicBreadcrumbProps, MobileDynamicBreadcrumbProps } from './components'

// Hooks
export { useBreadcrumb, useNavigation } from './hooks'
export type { NavigationOptions } from './hooks'

// Provider
export { BreadcrumbProvider, useBreadcrumbContext } from './providers'
export type { BreadcrumbProviderProps } from './providers'

// Core engine (for advanced usage)
export { BreadcrumbEngine } from './core'

// Types
export type {
  BreadcrumbItem,
  BreadcrumbConfig,
  BreadcrumbPlugin,
  RouteMetadata,
  RouteContext,
  CustomTranslations,
  AnimationConfig,
  StyleConfig,
  AccessibilityConfig,
  BreadcrumbEngineConfig
} from './types'

// Utilities (for advanced customization)
export {
  toTitleCase,
  formatSegmentLabel,
  createSlug,
  truncateText,
  formatBreadcrumbsForSchema,
  validateConfig,
  validateBreadcrumbs
} from './utils'