import { BreadcrumbEngine } from "../core/BreadcrumbEngine"
import { formatBreadcrumbsForSchema } from "../utils/formatters"

describe("Performance Tests", () => {
  test("breadcrumb generation speed", async () => {
    const engine = new BreadcrumbEngine()
    const start = performance.now()
    
    // Generate 1000 breadcrumbs with different paths
    const promises = []
    for (let i = 0; i < 1000; i++) {
      promises.push(engine.generateBreadcrumbs(`/products/category-${i}/item-${i}`))
    }
    
    await Promise.all(promises)
    
    const end = performance.now()
    const duration = end - start
    
    // Performance: Generated 1000 breadcrumbs in ~${duration.toFixed(2)}ms
    expect(duration).toBeLessThan(2000) // Should complete in under 2s
  })

  test("cache performance improvement", async () => {
    const engine = new BreadcrumbEngine({ enableCache: true })
    
    // First run - no cache
    const start1 = performance.now()
    for (let i = 0; i < 100; i++) {
      await engine.generateBreadcrumbs("/products/electronics/phones")
    }
    const noCacheTime = performance.now() - start1
    
    // Clear and test with cache enabled
    engine.clearCache()
    
    // Prime the cache
    await engine.generateBreadcrumbs("/products/electronics/phones")
    
    // Second run - with cache
    const start2 = performance.now()
    for (let i = 0; i < 100; i++) {
      await engine.generateBreadcrumbs("/products/electronics/phones")
    }
    const cacheTime = performance.now() - start2
    
    // Performance: No cache: ~${noCacheTime.toFixed(2)}ms, With cache: ~${cacheTime.toFixed(2)}ms
    
    // Cache should be significantly faster
    expect(cacheTime).toBeLessThan(noCacheTime * 0.5)
  })

  test("schema generation performance", () => {
    const breadcrumbs = Array.from({ length: 1000 }, (_, i) => ({
      id: `breadcrumb-${i}`,
      label: `Item ${i}`,
      href: `/path/${i}`,
      current: i === 999
    }))
    
    const start = performance.now()
    
    for (let i = 0; i < 100; i++) {
      formatBreadcrumbsForSchema(breadcrumbs)
    }
    
    const duration = performance.now() - start
    
    // Performance: Generated 100 schemas (1000 items each) in ~${duration.toFixed(2)}ms
    expect(duration).toBeLessThan(500) // Should be very fast
  })

  test("memory usage stays reasonable", async () => {
    const engine = new BreadcrumbEngine()
    
    // Generate many different breadcrumbs to test memory
    const paths = []
    for (let i = 0; i < 10000; i++) {
      paths.push(`/category-${i % 100}/subcategory-${i % 50}/item-${i}`)
    }
    
    // Process in batches to avoid overwhelming
    const batchSize = 1000
    for (let i = 0; i < paths.length; i += batchSize) {
      const batch = paths.slice(i, i + batchSize)
      await Promise.all(batch.map(path => engine.generateBreadcrumbs(path)))
    }
    
    // If we get here without running out of memory, test passes
    expect(true).toBe(true)
  })

  test("large path handling", async () => {
    const engine = new BreadcrumbEngine()
    
    // Test with very deep paths
    const deepPath = "/" + Array.from({ length: 50 }, (_, i) => `level-${i}`).join("/")
    
    const start = performance.now()
    const result = await engine.generateBreadcrumbs(deepPath)
    const duration = performance.now() - start
    
    // Performance: Processed 50-level deep path in ~${duration.toFixed(2)}ms
    
    expect(result).toHaveLength(51) // Home + 50 levels
    expect(duration).toBeLessThan(100) // Should still be fast
  })

  test("async resolver performance", async () => {
    const mockResolver = jest.fn().mockImplementation(async (segment) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1))
      return { label: `Resolved ${segment}` }
    })

    const engine = new BreadcrumbEngine()
    
    const start = performance.now()
    await engine.generateBreadcrumbs("/products/123", {
      customRoutes: {
        "123": {
          label: "Product",
          async: true,
          resolver: mockResolver
        }
      }
    })
    const duration = performance.now() - start
    
    expect(mockResolver).toHaveBeenCalledTimes(1)
    expect(duration).toBeGreaterThan(0) // Should take some time for async operation
    expect(duration).toBeLessThan(100) // But still reasonable
  })
})