import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BreadcrumbItem, BreadcrumbConfig } from '../types'

export interface NavigationOptions {
  scroll?: boolean
  shallow?: boolean
  replace?: boolean
}

export function useNavigation(config: BreadcrumbConfig = {}) {
  const router = useRouter?.()
  const pathname = usePathname?.()
  
  const navigate = useCallback(async (
    href: string, 
    item: BreadcrumbItem, 
    options: NavigationOptions = {}
  ) => {
    try {
      // Custom navigation handler
      if (config.onNavigate) {
        await config.onNavigate(href, item)
        return
      }
      
      // Next.js navigation
      if (router) {
        const method = options.replace ? 'replace' : 'push'
        await router[method](href, { 
          scroll: options.scroll !== false 
        })
        return
      }
      
      // Fallback to window navigation
      if (typeof window !== 'undefined') {
        if (options.replace) {
          window.location.replace(href)
        } else {
          window.location.href = href
        }
      }
    } catch (error) {
      console.error('Navigation failed:', error)
      config.onError?.(error as Error)
    }
  }, [router, config])
  
  const goBack = useCallback(() => {
    if (router) {
      router.back()
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }, [router])
  
  const canGoBack = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.history.length > 1
  }, [])
  
  return {
    navigate,
    goBack,
    canGoBack,
    currentPath: pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
  }
}