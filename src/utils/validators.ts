import { BreadcrumbConfig, BreadcrumbItem } from '../types'

/**
 * Validates breadcrumb configuration
 */
export function validateConfig(config: BreadcrumbConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate locale if provided
  if (config.locale && typeof config.locale !== 'string') {
    errors.push('locale must be a string')
  }
  
  // Validate maxSlugLength
  if (config.maxSlugLength !== undefined) {
    if (typeof config.maxSlugLength !== 'number' || config.maxSlugLength < 1) {
      errors.push('maxSlugLength must be a positive number')
    }
  }
  
  // Validate customRoutes
  if (config.customRoutes) {
    Object.entries(config.customRoutes).forEach(([key, route]) => {
      if (!route.label) {
        errors.push(`customRoutes.${key}.label is required`)
      }
      
      if (route.async && !route.resolver) {
        errors.push(`customRoutes.${key}.resolver is required when async is true`)
      }
    })
  }
  
  // Validate animations config
  if (config.animations) {
    const validTypes = ['fade', 'slide', 'scale', 'bounce', 'none']
    if (config.animations.type && !validTypes.includes(config.animations.type)) {
      errors.push(`animations.type must be one of: ${validTypes.join(', ')}`)
    }
    
    if (config.animations.duration !== undefined) {
      if (typeof config.animations.duration !== 'number' || config.animations.duration < 0) {
        errors.push('animations.duration must be a non-negative number')
      }
    }
  }
  
  // Validate accessibility config
  if (config.accessibility?.ariaLabels) {
    const requiredLabels = ['navigation', 'current', 'back', 'separator'] as const
    requiredLabels.forEach(label => {
      if (config.accessibility?.ariaLabels) {
        const ariaLabel = config.accessibility.ariaLabels[label]
        if (ariaLabel && typeof ariaLabel !== 'string') {
          errors.push(`accessibility.ariaLabels.${label} must be a string`)
        }
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates breadcrumb items array
 */
export function validateBreadcrumbs(breadcrumbs: BreadcrumbItem[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const ids = new Set<string>()
  
  breadcrumbs.forEach((item, index) => {
    // Check required fields
    if (!item.id) {
      errors.push(`breadcrumb at index ${index} is missing required 'id' field`)
    } else if (ids.has(item.id)) {
      errors.push(`duplicate breadcrumb id '${item.id}' at index ${index}`)
    } else {
      ids.add(item.id)
    }
    
    if (!item.label) {
      errors.push(`breadcrumb at index ${index} is missing required 'label' field`)
    }
    
    if (!item.href) {
      errors.push(`breadcrumb at index ${index} is missing required 'href' field`)
    }
    
    if (typeof item.current !== 'boolean') {
      errors.push(`breadcrumb at index ${index} 'current' field must be a boolean`)
    }
    
    // Validate href format
    if (item.href && !isValidHref(item.href)) {
      errors.push(`breadcrumb at index ${index} has invalid href '${item.href}'`)
    }
  })
  
  // Check that only one item is marked as current
  const currentItems = breadcrumbs.filter(item => item.current)
  if (currentItems.length > 1) {
    errors.push('only one breadcrumb item can be marked as current')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates URL href format
 */
export function isValidHref(href: string): boolean {
  if (!href || typeof href !== 'string') return false
  
  // Allow relative paths starting with /
  if (href.startsWith('/')) return true
  
  // Allow full URLs
  try {
    new URL(href)
    return true
  } catch {
    return false
  }
}

/**
 * Validates URL path segments
 */
export function isValidPathSegment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') return false
  
  // Check for invalid characters
  const invalidChars = /[<>"'%{}|\\^`[\]]/
  if (invalidChars.test(segment)) return false
  
  // Check for reserved names
  const reserved = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9']
  if (reserved.includes(segment.toLowerCase())) return false
  
  return true
}

/**
 * Sanitizes user input for safe use in URLs
 */
export function sanitizeSegment(segment: string): string {
  return segment
    .replace(/[<>"'%{}|\\^`[\]]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase()
}

/**
 * Validates locale string format
 */
export function isValidLocale(locale: string): boolean {
  if (!locale || typeof locale !== 'string') return false
  
  // Basic locale format validation (language or language-region)
  const localePattern = /^[a-z]{2,3}(-[A-Z]{2,4})?$/
  return localePattern.test(locale)
}

/**
 * Validates schema.org structured data
 */
export function validateSchemaData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context')
  }
  
  if (!data['@type'] || data['@type'] !== 'BreadcrumbList') {
    errors.push('Missing or invalid @type')
  }
  
  if (!Array.isArray(data.itemListElement)) {
    errors.push('itemListElement must be an array')
  } else {
    (data.itemListElement as Record<string, unknown>[]).forEach((item, index: number) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`Item at index ${index} missing or invalid @type`)
      }
      
      if (!item.position || typeof item.position !== 'number') {
        errors.push(`Item at index ${index} missing or invalid position`)
      }
      
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`Item at index ${index} missing or invalid name`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}