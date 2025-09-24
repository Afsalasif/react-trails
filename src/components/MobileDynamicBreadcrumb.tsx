"use client"

import { useMemo } from 'react'
import { useBreadcrumb } from '../hooks/useBreadcrumb'
import { BreadcrumbConfig } from '../types'

export interface MobileDynamicBreadcrumbProps extends BreadcrumbConfig {
  className?: string
  showBackButton?: boolean
  backButtonText?: string
  maxLabelLength?: number
  'data-testid'?: string
}

export function MobileDynamicBreadcrumb({
  className = '',
  showBackButton = true,
  backButtonText,
  maxLabelLength = 25,
  'data-testid': testId = 'mobile-breadcrumb',
  ...config
}: MobileDynamicBreadcrumbProps) {
  const { breadcrumbs, loading, error, navigate } = useBreadcrumb(config)
  
  const { currentPage, parentPage, canGoBack } = useMemo(() => {
    if (breadcrumbs.length === 0) {
      return { 
        currentPage: config.translations?.home || 'Home', 
        parentPage: null,
        canGoBack: false
      }
    }
    
    const current = breadcrumbs[breadcrumbs.length - 1]
    const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null
    
    return {
      currentPage: current.label,
      parentPage: parent?.label || (config.translations?.home || 'Home'),
      canGoBack: breadcrumbs.length > 1 || current.href !== '/'
    }
  }, [breadcrumbs, config.translations])

  const handleBack = () => {
    if (breadcrumbs.length <= 1) {
      navigate('/', { 
        id: 'home',
        label: 'Home', 
        href: '/', 
        current: false 
      })
    } else {
      const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2]
      navigate(parentBreadcrumb.href, parentBreadcrumb)
    }
  }

  if (error && config.errorComponent) {
    return <div data-testid={`${testId}-error`}>{config.errorComponent}</div>
  }
  
  if (loading && config.loadingComponent) {
    return <div data-testid={`${testId}-loading`}>{config.loadingComponent}</div>
  }

  if (breadcrumbs.length === 0 && !config.showOnHome) {
    return null
  }

  const containerClasses = config.styles?.mobile?.container || 
    "flex items-center justify-between w-full px-4 py-2 bg-white border-b"
  const backButtonClasses = config.styles?.mobile?.backButton ||
    "flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-gray-50"
  const currentClasses = config.styles?.mobile?.current ||
    "text-sm font-medium text-blue-600 truncate ml-auto"

  const backLabel = backButtonText || config.translations?.back || 'Back'
  const truncatedCurrent = currentPage.length > maxLabelLength 
    ? `${currentPage.substring(0, maxLabelLength)}...`
    : currentPage
  const truncatedParent = parentPage && parentPage.length > 15
    ? `${parentPage.substring(0, 15)}...`
    : parentPage

  return (
    <div 
      className={`${containerClasses} ${className}`.trim()}
      data-testid={testId}
    >
      {showBackButton && canGoBack && (
        <button
          onClick={handleBack}
          className={backButtonClasses}
          aria-label={`${backLabel} to ${parentPage}`}
          data-testid={`${testId}-back`}
        >
          <svg 
            className="h-4 w-4 rotate-180" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="truncate">
            {backLabel}
            {truncatedParent && (
              <span className="text-xs text-gray-400 ml-1">to {truncatedParent}</span>
            )}
          </span>
        </button>
      )}
      
      <span 
        className={`${currentClasses} ${showBackButton && canGoBack ? 'max-w-[60%]' : 'max-w-full'}`}
        title={currentPage}
        data-testid={`${testId}-current`}
      >
        {truncatedCurrent}
      </span>
    </div>
  )
}