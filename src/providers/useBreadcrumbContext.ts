import { useContext } from 'react'
import { BreadcrumbContext, BreadcrumbContextValue } from './BreadcrumbContext'

export function useBreadcrumbContext(): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider')
  }
  return context
}