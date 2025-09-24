import { RouteContext, CustomTranslations } from '../types'

export class RouteFormatter {
  private translations: CustomTranslations
  private locale: string
  
  constructor(translations: Partial<CustomTranslations> = {}, locale = 'en') {
    this.translations = {
      home: 'Home',
      back: 'Back',
      details: 'Details',
      loading: 'Loading...',
      error: 'Error',
      ...translations
    }
    this.locale = locale
  }
  
  formatSegment(segment: string, _context: RouteContext): string {
    // Use Intl APIs for locale-aware formatting when available
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      try {
        const displayNames = new Intl.DisplayNames([this.locale], { type: 'region' })
        // Try to get localized name for known values
        if (segment.length === 2) {
          return displayNames.of(segment.toUpperCase()) || this.titleCase(segment)
        }
      } catch {
        // Fallback to manual formatting
      }
    }
    
    return this.titleCase(segment)
  }
  
  private titleCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  
  getTranslation(key: string): string {
    return this.translations[key] || key
  }
  
  truncateLabel(label: string, maxLength: number): string {
    if (label.length <= maxLength) return label
    return label.substring(0, maxLength - 3) + '...'
  }
}