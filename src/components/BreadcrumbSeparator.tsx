import { ReactNode } from 'react'

export interface BreadcrumbSeparatorProps {
  separator?: ReactNode
  className?: string
  ariaHidden?: boolean
}

export function BreadcrumbSeparator({ 
  separator = '/', 
  className = '', 
  ariaHidden = true 
}: BreadcrumbSeparatorProps) {
  const defaultClasses = "mx-1 text-gray-400 select-none"
  const separatorClasses = className 
    ? `${defaultClasses} ${className}`
    : defaultClasses
  
  return (
    <span 
      className={separatorClasses}
      aria-hidden={ariaHidden}
      data-testid="breadcrumb-separator"
    >
      {separator}
    </span>
  )
}