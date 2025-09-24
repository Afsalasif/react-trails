"use client"

import { useMemo, HTMLAttributes } from 'react'
import { useBreadcrumb } from '../hooks/useBreadcrumb'
import { BreadcrumbItem as BreadcrumbItemComponent } from './BreadcrumbItem'
import { BreadcrumbSeparator } from './BreadcrumbSeparator'
import { AnimationWrapper } from './AnimationWrapper'
import { BreadcrumbConfig } from '../types'

export interface DynamicBreadcrumbProps extends BreadcrumbConfig {
  className?: string
  containerProps?: HTMLAttributes<HTMLElement>
  'data-testid'?: string
}

export function DynamicBreadcrumb({
  className = '',
  containerProps = {},
  'data-testid': testId = 'dynamic-breadcrumb',
  ...config
}: DynamicBreadcrumbProps) {
  const { breadcrumbs, loading, error, navigate } = useBreadcrumb(config)
  
  const shouldRender = useMemo(() => {
    return config.showOnHome || breadcrumbs.length > 0
  }, [config.showOnHome, breadcrumbs.length])
  
  if (!shouldRender) return null
  
  if (error && config.errorComponent) {
    return <div data-testid={`${testId}-error`}>{config.errorComponent}</div>
  }
  
  if (loading && config.loadingComponent) {
    return <div data-testid={`${testId}-loading`}>{config.loadingComponent}</div>
  }
  
  const ariaLabel = config.accessibility?.ariaLabels?.navigation || 'Breadcrumb navigation'
  const defaultClasses = "flex items-center space-x-1 text-sm overflow-hidden"
  const containerClasses = config.styles?.container 
    ? `${defaultClasses} ${config.styles.container}` 
    : defaultClasses
  
  return (
    <nav
      aria-label={ariaLabel}
      className={`${containerClasses} ${className}`.trim()}
      role="navigation"
      aria-live={config.accessibility?.announceChanges === false ? undefined : 'polite'}
      data-testid={testId}
      {...containerProps}
    >
      <ol 
        className={`flex items-center space-x-1 max-w-full overflow-hidden ${config.styles?.list || ''}`}
        role="list"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbs.map((item, index) => (
          <li 
            key={item.id} 
            className="flex items-center shrink-0"
            role="listitem"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <BreadcrumbSeparator 
                separator={config.separator}
                className={config.styles?.separator}
                ariaHidden={true}
              />
            )}
            <AnimationWrapper 
              config={config.animations}
              index={index}
            >
              {/* Schema.org Thing wrapper to provide item/name without changing UI */}
              <span itemProp="item" itemScope itemType="https://schema.org/Thing" className="contents">
                <BreadcrumbItemComponent
                  item={item}
                  config={config}
                  onClick={navigate}
                />
                <meta itemProp="name" content={item.label} />
              </span>
            </AnimationWrapper>
            <meta itemProp="position" content={`${index + 1}`} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
