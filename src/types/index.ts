import { BreadcrumbItem, RouteMetadata, RouteContext, CustomTranslations } from './breadcrumb'
import { BreadcrumbEngineConfig, AnimationConfig, StyleConfig, AccessibilityConfig } from './config'

export interface BreadcrumbConfig {
  // Core settings
  showOnHome?: boolean
  enableCache?: boolean
  
  // Engine configuration
  engine?: Partial<BreadcrumbEngineConfig>
  
  // Route handling
  customRoutes?: RouteMetadata
  restrictedRoutes?: string[]
  locales?: string[]
  maxSlugLength?: number
  
  // Internationalization
  translations?: Partial<CustomTranslations>
  locale?: string
  
  // Styling
  styles?: StyleConfig
  className?: string
  separator?: React.ReactNode
  
  // Animation
  animations?: Partial<AnimationConfig>
  
  // Accessibility
  accessibility?: Partial<AccessibilityConfig>
  
  // Loading
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  
  // Event handlers
  onNavigate?: (href: string, item: BreadcrumbItem) => void | Promise<void>
  onLoad?: (breadcrumbs: BreadcrumbItem[]) => void
  onError?: (error: Error) => void
  
  // Advanced customization
  formatLabel?: (segment: string, context: RouteContext) => string
  shouldSkipSegment?: (segment: string, context: RouteContext) => boolean
  generateId?: (item: BreadcrumbItem, index: number) => string
  
  // Plugin system
  plugins?: BreadcrumbPlugin[]
}

export interface BreadcrumbPlugin {
  name: string
  beforeGenerate?: (pathname: string, config: BreadcrumbConfig) => void
  afterGenerate?: (breadcrumbs: BreadcrumbItem[], config: BreadcrumbConfig) => BreadcrumbItem[]
  beforeRender?: (breadcrumbs: BreadcrumbItem[]) => BreadcrumbItem[]
}

export * from './breadcrumb'
export * from './config'