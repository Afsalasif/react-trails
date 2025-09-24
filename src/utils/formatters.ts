import { BreadcrumbItem, RouteContext } from '../types'

/**
 * Converts kebab-case or snake_case strings to Title Case
 */
export function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Formats URL segments for display
 */
export function formatSegmentLabel(segment: string): string {
  // Handle special cases
  if (segment === '') return ''
  if (segment === 'index') return 'Home'
  
  // Handle UUIDs and other IDs
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return 'Item Details'
  }
  
  if (/^[0-9a-fA-F]{24}$/.test(segment)) {
    return 'Details'
  }
  
  if (/^\d+$/.test(segment)) {
    return `Item #${segment}`
  }
  
  // Format normal segments
  return toTitleCase(segment)
}

/**
 * Creates URL-safe slugs from strings
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Formats breadcrumb items for schema.org structured data
 */
export function formatBreadcrumbsForSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: {
        '@type': 'Thing',
        '@id': item.href,
        name: item.label
      }
    }))
  }
}

/**
 * Validates and normalizes URL paths
 */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  
  // Remove trailing slashes, preserve leading slash
  return '/' + path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')
}

/**
 * Extracts meaningful context from route segments
 */
export function getRouteContext(segments: string[], index: number): RouteContext {
  const pathname = '/' + segments.slice(0, index + 1).join('/')
  const parent = index > 0 ? segments[index - 1] : undefined
  
  return {
    pathname,
    segments,
    index,
    parent: parent ? {
      id: `breadcrumb-${index - 1}-${parent}`,
      label: formatSegmentLabel(parent),
      href: '/' + segments.slice(0, index).join('/'),
      current: false
    } : undefined
  }
}

/**
 * Detects and formats different types of dynamic segments
 */
export function formatDynamicSegment(segment: string, context?: RouteContext): string {
  // UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    const parent = context?.parent?.label || 'Item'
    return `${parent} Details`
  }
  
  // MongoDB ObjectId format
  if (/^[0-9a-fA-F]{24}$/.test(segment)) {
    return 'Details'
  }
  
  // Numeric ID
  if (/^\d+$/.test(segment)) {
    const parent = context?.parent?.label || 'Item'
    return `${parent} #${segment}`
  }
  
  // Multi-word slug with context awareness
  if (segment.includes('-') && segment.split('-').length >= 3) {
    return toTitleCase(segment)
  }
  
  // Long strings (likely product names or titles)
  if (segment.length > 20) {
    return toTitleCase(segment.substring(0, 30))
  }
  
  // Default formatting
  return formatSegmentLabel(segment)
}