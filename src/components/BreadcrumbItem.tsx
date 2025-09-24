import { useMemo, MouseEvent, KeyboardEvent } from 'react'
import type { BreadcrumbItem, BreadcrumbConfig } from '../types'

interface BreadcrumbItemProps {
  item: BreadcrumbItem
  config: BreadcrumbConfig
  onClick: (href: string, item: BreadcrumbItem) => void
}

export function BreadcrumbItem({ item, config, onClick }: BreadcrumbItemProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    if (!item.disabled) {
      onClick(item.href, item)
    }
  }
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (config.accessibility?.keyboardNavigation !== false) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!item.disabled) {
          onClick(item.href, item)
        }
      }
    }
  }
  
  const classes = useMemo(() => {
    const baseClasses = "flex items-center space-x-1 px-2 py-1 rounded truncate max-w-[150px] transition-colors duration-200"
    
    if (item.current) {
      return config.styles?.current 
        ? `${baseClasses} ${config.styles.current}`
        : `${baseClasses} text-blue-600 font-medium`
    }
    
    if (item.disabled) {
      return config.styles?.disabled
        ? `${baseClasses} ${config.styles.disabled}`
        : `${baseClasses} text-gray-400 cursor-not-allowed opacity-60`
    }
    
    return config.styles?.item
      ? `${baseClasses} ${config.styles.item}`
      : `${baseClasses} text-gray-600 hover:text-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`
  }, [item, config.styles])
  
  const currentAriaLabel = config.accessibility?.ariaLabels?.current || 'Current page'
  const ariaLabel = item.current 
    ? `${currentAriaLabel}: ${item.label}`
    : `Navigate to ${item.label}`
  
  if (item.current) {
    return (
      <span 
        className={classes}
        aria-current="page"
        aria-label={currentAriaLabel}
        title={item.label}
        data-testid={`breadcrumb-current-${item.id}`}
      >
        {item.icon && <span aria-hidden="true">{item.icon}</span>}
        <span className="truncate">{item.label}</span>
      </span>
    )
  }

  if (item.disabled) {
    return (
      <span
        className={classes}
        aria-disabled="true"
        title={item.label}
        data-testid={`breadcrumb-disabled-${item.id}`}
      >
        {item.icon && <span aria-hidden="true">{item.icon}</span>}
        <span className="truncate">{item.label}</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={classes}
      aria-label={ariaLabel}
      title={item.label}
      tabIndex={0}
      data-testid={`breadcrumb-link-${item.id}`}
    >
      {item.icon && <span aria-hidden="true">{item.icon}</span>}
      <span className="truncate">{item.label}</span>
    </button>
  )
}