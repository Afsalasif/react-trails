import { createContext } from 'react'
import { BreadcrumbConfig, BreadcrumbItem } from '../types'
import { BreadcrumbEngine } from '../core/BreadcrumbEngine'

export interface BreadcrumbContextValue {
  config: BreadcrumbConfig
  engine: BreadcrumbEngine
  globalBreadcrumbs: BreadcrumbItem[]
  setGlobalBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  updateConfig: (newConfig: Partial<BreadcrumbConfig>) => void
  refresh: () => void
}

// Create context with defensive check for SSR
let BreadcrumbContext: ReturnType<typeof createContext<BreadcrumbContextValue | null>>

try {
  BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)
} catch (error) {
  // Fallback for environments where createContext might not be available
  console.warn('BreadcrumbContext: createContext is not available, using fallback')
  BreadcrumbContext = {
    Provider: ({ children }: { children: any }) => children,
    Consumer: ({ children }: { children: (value: any) => any }) => children(null),
    displayName: 'BreadcrumbContext'
  } as any
}

export { BreadcrumbContext }
