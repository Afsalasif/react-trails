import { useCallback, useMemo, useState, ReactNode } from 'react'
import { BreadcrumbConfig, BreadcrumbItem } from '../types'
import { BreadcrumbEngine } from '../core/BreadcrumbEngine'
import { BreadcrumbContext, BreadcrumbContextValue } from './BreadcrumbContext'

export interface BreadcrumbProviderProps {
  children: ReactNode
  config?: BreadcrumbConfig
}

export function BreadcrumbProvider({ children, config = {} }: BreadcrumbProviderProps) {
  const [providerConfig, setProviderConfig] = useState(config)
  const [globalBreadcrumbs, setGlobalBreadcrumbs] = useState<BreadcrumbItem[]>([])
  
  const engine = useMemo(() => new BreadcrumbEngine(providerConfig), [providerConfig])
  
  const updateConfig = useCallback((newConfig: Partial<BreadcrumbConfig>) => {
    setProviderConfig(prev => ({ ...prev, ...newConfig }))
  }, [])
  
  const refresh = useCallback(() => {
    engine.clearCache()
  }, [engine])
  
  const value = useMemo((): BreadcrumbContextValue => ({
    config: providerConfig,
    engine,
    globalBreadcrumbs,
    setGlobalBreadcrumbs,
    updateConfig,
    refresh
  }), [providerConfig, engine, globalBreadcrumbs, updateConfig, refresh])
  
  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}
