import { 
  DynamicBreadcrumb, 
  BreadcrumbEngine, 
  formatBreadcrumbsForSchema,
  validateConfig,
  toTitleCase,
  formatSegmentLabel,
  MobileDynamicBreadcrumb
} from "../index"

describe("API Testing", () => {
  test("all main exports available", () => {
    expect(DynamicBreadcrumb).toBeDefined()
    expect(MobileDynamicBreadcrumb).toBeDefined()
    expect(BreadcrumbEngine).toBeDefined()
    expect(formatBreadcrumbsForSchema).toBeDefined()
    expect(validateConfig).toBeDefined()
    expect(toTitleCase).toBeDefined()
    expect(formatSegmentLabel).toBeDefined()
  })

  test("engine generates correct breadcrumbs", async () => {
    const engine = new BreadcrumbEngine()
    const result = await engine.generateBreadcrumbs("/products/123")
    
    expect(result).toHaveLength(3)
    expect(result[0].label).toBe("Home")
    expect(result[1].label).toBe("Products")
    expect(result[2].current).toBe(true)
  })

  test("schema generation works", () => {
    const breadcrumbs = [
      { id: "1", label: "Home", href: "/", current: false },
      { id: "2", label: "Products", href: "/products", current: true }
    ]
    
    const schema = formatBreadcrumbsForSchema(breadcrumbs)
    expect(schema["@type"]).toBe("BreadcrumbList")
    expect(schema.itemListElement).toHaveLength(2)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].position).toBe(2)
  })

  test("utility functions work", () => {
    expect(toTitleCase("hello-world")).toBe("Hello World")
    expect(formatSegmentLabel("product-name")).toBe("Product Name")
    expect(formatSegmentLabel("123")).toBe("Item #123")
  })

  test("engine handles different path formats", async () => {
    const engine = new BreadcrumbEngine({ engine: { restrictedRoutes: [] } }) // Remove restrictions for this test
    
    // Test with trailing slash
    const result1 = await engine.generateBreadcrumbs("/products/")
    expect(result1).toHaveLength(2)
    
    // Test with double slashes
    const result2 = await engine.generateBreadcrumbs("//products//items//")
    expect(result2).toHaveLength(3)
    
    // Test with complex path
    const result3 = await engine.generateBreadcrumbs("/en/products/luxury-smartphone-pro")
    expect(result3).toHaveLength(3) // Should filter out locale
    expect(result3[2].label).toBe("Luxury Smartphone Pro")
  })

  test("configuration validation works", () => {
    const validConfig = {
      showOnHome: true,
      animations: { enabled: true, type: "fade" as const },
      translations: { home: "Home" }
    }
    
    const result = validateConfig(validConfig)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test("detects invalid configuration", () => {
    const invalidConfig = {
      maxSlugLength: -1, // Invalid
      animations: { type: "invalid" as "fade" } // Invalid - wrong animation type
    }
    
    const result = validateConfig(invalidConfig)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  test("engine caching works", async () => {
    const engine = new BreadcrumbEngine({ enableCache: true })
    
    const start1 = performance.now()
    await engine.generateBreadcrumbs("/products/123")
    const time1 = performance.now() - start1
    
    const start2 = performance.now()
    await engine.generateBreadcrumbs("/products/123") // Should use cache
    const time2 = performance.now() - start2
    
    // Cache should be faster (though this might be flaky in CI)
    expect(time2).toBeLessThanOrEqual(time1)
  })
})