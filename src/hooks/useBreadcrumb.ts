import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigation } from './useNavigation'
import { BreadcrumbConfig, BreadcrumbItem } from '../types'
import { BreadcrumbEngine } from '../core/BreadcrumbEngine'

export function useBreadcrumb(config: BreadcrumbConfig = {}) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const { navigate, currentPath } = useNavigation(config)
  
  // Memoize config to prevent infinite re-renders
  const configString = JSON.stringify(config)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableConfig = useMemo(() => config, [configString]) // Using configString instead of config to prevent infinite re-renders
  const engine = useMemo(() => new BreadcrumbEngine(stableConfig), [stableConfig])
  
  const generateBreadcrumbs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Apply plugins - beforeGenerate
      if (stableConfig.plugins) {
        for (const plugin of stableConfig.plugins) {
          plugin.beforeGenerate?.(currentPath, stableConfig)
        }
      }
      
      const result = await engine.generateBreadcrumbs(currentPath, stableConfig)
      
      // Apply plugins - beforeRender  
      let finalResult = result
      if (stableConfig.plugins) {
        for (const plugin of stableConfig.plugins) {
          if (plugin.beforeRender) {
            finalResult = plugin.beforeRender(finalResult)
          }
        }
      }
      
      setBreadcrumbs(finalResult)
      stableConfig.onLoad?.(finalResult)
    } catch (err) {
      const error = err as Error
      setError(error)
      stableConfig.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [currentPath, engine, stableConfig])
  
  useEffect(() => {
    generateBreadcrumbs()
  }, [generateBreadcrumbs])
  
  const refresh = useCallback(() => {
    engine.clearCache()
    generateBreadcrumbs()
  }, [engine, generateBreadcrumbs])
  
  return {
    breadcrumbs,
    loading,
    error,
    navigate,
    refresh,
    currentPath
  }
}