import { BreadcrumbConfig, BreadcrumbItem, RouteContext, BreadcrumbEngineConfig } from '../types'
import { SegmentDetector, SegmentPattern } from './SegmentDetector'
import { RouteFormatter } from './RouteFormatter'

export class BreadcrumbEngine {
  private config: BreadcrumbEngineConfig
  private detector: SegmentDetector
  private formatter: RouteFormatter
  private cache: Map<string, BreadcrumbItem[]>
  
  constructor(userConfig: BreadcrumbConfig = {}) {
    this.config = {
      locales: ['en', 'ar', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'hi', 'ur'],
      restrictedRoutes: ['products', 'categories', 'collections'],
      staticRoutes: ['dashboard', 'settings', 'profile', 'admin', 'blog', 'about', 'contact'],
      maxSlugLength: 30,
      dynamicPatterns: [],
      enableCache: true,
      ...userConfig.engine
    }
    
    this.detector = new SegmentDetector(
      this.config.dynamicPatterns.map((pattern, idx) => {
        if (typeof pattern === 'object' && 'name' in pattern && 'pattern' in pattern && 'priority' in pattern) {
          return pattern as SegmentPattern
        }
        // Convert RegExp to SegmentPattern
        return {
          name: `pattern${idx}`,
          pattern: pattern as RegExp,
          priority: 0
        }
      })
    )
    this.formatter = new RouteFormatter(userConfig.translations, userConfig.locale)
    this.cache = new Map()
  }
  
  async generateBreadcrumbs(pathname: string, userConfig: BreadcrumbConfig = {}): Promise<BreadcrumbItem[]> {
    const cacheKey = this.getCacheKey(pathname, userConfig)
    
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached) {
        return cached
      }
    }
    
    // Apply beforeGenerate plugins
    if (userConfig.plugins) {
      for (const plugin of userConfig.plugins) {
        if (plugin.beforeGenerate) {
          plugin.beforeGenerate(pathname, userConfig)
        }
      }
    }
    
    const segments = this.parsePathname(pathname)
    
    if (segments.length === 0) {
      const result = userConfig.showOnHome ? [this.createHomeItem(true)] : []
      if (this.config.enableCache) this.cache.set(cacheKey, result)
      return result
    }
    
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Add home item for non-home pages
    breadcrumbs.push(this.createHomeItem(false))
    
    // Handle restricted routes
    if (this.isRestrictedRoute(segments[0]) && segments.length === 1) {
      if (this.config.enableCache) this.cache.set(cacheKey, breadcrumbs)
      return breadcrumbs
    }
    
    // Build breadcrumb chain
    await this.buildBreadcrumbChain(segments, breadcrumbs, userConfig)
    
    // Apply plugins
    let result = breadcrumbs
    if (userConfig.plugins) {
      for (const plugin of userConfig.plugins) {
        if (plugin.afterGenerate) {
          result = plugin.afterGenerate(result, userConfig)
        }
      }
    }
    
    if (this.config.enableCache) this.cache.set(cacheKey, result)
    return result
  }
  
  private async buildBreadcrumbChain(
    segments: string[], 
    breadcrumbs: BreadcrumbItem[], 
    userConfig: BreadcrumbConfig
  ): Promise<void> {
    let currentPath = ''
    
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index]
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      const context: RouteContext = {
        pathname: currentPath,
        segments,
        index,
        parent: breadcrumbs[breadcrumbs.length - 1]
      }
      
      if (this.shouldSkipSegment(segment, context, userConfig)) {
        continue
      }
      
      const item = await this.createBreadcrumbItem(segment, currentPath, isLast, context, userConfig)
      if (item && !item.hidden) {
        breadcrumbs.push(item)
      }
    }
  }
  
  private async createBreadcrumbItem(
    segment: string,
    href: string,
    current: boolean,
    context: RouteContext,
    userConfig: BreadcrumbConfig
  ): Promise<BreadcrumbItem | null> {
    const customRoute = userConfig.customRoutes?.[segment]
    let label = segment
    let icon: React.ReactNode = undefined
    let disabled = false
    
    // Handle custom routes
    if (customRoute) {
      if (typeof customRoute.label === 'function') {
        label = customRoute.label(context.pathname)
      } else {
        label = customRoute.label
      }
      
      icon = customRoute.icon
      disabled = customRoute.disabled || false
      
      // Handle async resolvers
      if (customRoute.async && customRoute.resolver) {
        try {
          const resolved = await customRoute.resolver(segment, context)
          label = resolved.label || label
          icon = resolved.icon || icon
          disabled = resolved.disabled || disabled
        } catch (error) {
          console.warn(`Failed to resolve route data for ${segment}:`, error)
        }
      }
    } else {
      // Format segment label
      if (userConfig.formatLabel) {
        label = userConfig.formatLabel(segment, context)
      } else {
        label = this.getSegmentLabel(segment, context)
      }
    }
    
    // Truncate if needed
    if (this.config.maxSlugLength) {
      label = this.formatter.truncateLabel(label, this.config.maxSlugLength)
    }
    
    const id = userConfig.generateId 
      ? userConfig.generateId({ label, href, current } as BreadcrumbItem, context.index)
      : `breadcrumb-${context.index}-${segment}`
    
    return {
      id,
      label,
      href,
      current,
      icon,
      disabled,
      hidden: false
    }
  }
  
  private parsePathname(pathname: string): string[] {
    const allSegments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
    return allSegments.filter(segment => !this.isLocaleSegment(segment))
  }
  
  private isLocaleSegment(segment: string): boolean {
    return this.config.locales.includes(segment.toLowerCase())
  }
  
  private isRestrictedRoute(segment: string): boolean {
    return this.config.restrictedRoutes.includes(segment)
  }
  
  private shouldSkipSegment(segment: string, context: RouteContext, userConfig: BreadcrumbConfig): boolean {
    // Use custom skip logic if provided
    if (userConfig.shouldSkipSegment) {
      return userConfig.shouldSkipSegment(segment, context)
    }
    
    // Default skip logic
    return this.isRestrictedRoute(segment) && context.index === 0 && context.segments.length === 1
  }
  
  private createHomeItem(current: boolean): BreadcrumbItem {
    return {
      id: 'breadcrumb-home',
      label: this.formatter.getTranslation('home'),
      href: '/',
      current,
      icon: undefined
    }
  }
  
  private getSegmentLabel(segment: string, context: RouteContext): string {
    if (this.detector.isDynamic(segment, this.config.staticRoutes)) {
      return this.formatDynamicSegment(segment, context)
    }
    
    return this.formatter.formatSegment(segment, context)
  }
  
  private formatDynamicSegment(segment: string, context: RouteContext): string {
    const parentSegment = context.index > 0 ? context.segments[context.index - 1] : ''
    
    // Context-aware formatting
    switch (parentSegment) {
      case 'products':
      case 'collections':
      case 'blog':
        return this.detector.formatDynamicSegment(segment)
      case 'users':
        if (segment.match(/^\d+$/)) {
          return `User #${segment}`
        }
        return this.detector.formatDynamicSegment(segment)
      default:
        return segment.includes('-') 
          ? this.detector.formatDynamicSegment(segment)
          : this.formatter.getTranslation('details')
    }
  }
  
  private getCacheKey(pathname: string, config: BreadcrumbConfig): string {
    return `${pathname}-${JSON.stringify({
      showOnHome: config.showOnHome,
      restrictedRoutes: config.restrictedRoutes,
      locales: config.locales,
      customRoutes: config.customRoutes ? Object.keys(config.customRoutes) : []
    })}`
  }
  
  clearCache(): void {
    this.cache.clear()
  }
}