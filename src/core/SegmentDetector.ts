export interface SegmentPattern {
  name: string
  pattern: RegExp
  priority: number
  formatter?: (segment: string) => string
}

export class SegmentDetector {
  private patterns: SegmentPattern[]
  
  constructor(customPatterns?: SegmentPattern[]) {
    this.patterns = [
      {
        name: 'uuid',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        priority: 100
      },
      {
        name: 'mongoId', 
        pattern: /^[0-9a-fA-F]{24}$/,
        priority: 90
      },
      {
        name: 'numericId',
        pattern: /^\d+$/,
        priority: 80
      },
      {
        name: 'slug',
        pattern: /^.+-.+-.+/,
        priority: 70,
        formatter: (segment: string) => segment.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      },
      {
        name: 'longString',
        pattern: /^.{15,}$/,
        priority: 60
      },
      ...(customPatterns || [])
    ].sort((a, b) => b.priority - a.priority)
  }
  
  isDynamic(segment: string, staticRoutes: string[] = []): boolean {
    if (staticRoutes.includes(segment)) return false
    return this.patterns.some(pattern => pattern.pattern.test(segment))
  }
  
  getSegmentType(segment: string): SegmentPattern | null {
    return this.patterns.find(pattern => pattern.pattern.test(segment)) || null
  }
  
  formatDynamicSegment(segment: string): string {
    const type = this.getSegmentType(segment)
    if (type?.formatter) {
      return type.formatter(segment)
    }
    
    // Default formatting
    return segment.includes('-') 
      ? segment.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ')
      : segment
  }
}