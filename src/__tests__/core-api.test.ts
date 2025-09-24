// Core API tests - no React components, just pure JavaScript/TypeScript logic
import { BreadcrumbEngine } from "../core/BreadcrumbEngine"
import { RouteFormatter } from "../core/RouteFormatter"
import { SegmentDetector } from "../core/SegmentDetector"
import { formatBreadcrumbsForSchema, validateConfig, toTitleCase, formatSegmentLabel } from "../utils"

describe("Core API Testing (No React)", () => {
  describe("BreadcrumbEngine", () => {
    test("creates engine instance", () => {
      const engine = new BreadcrumbEngine()
      expect(engine).toBeDefined()
      expect(typeof engine.generateBreadcrumbs).toBe("function")
      expect(typeof engine.clearCache).toBe("function")
    })

    test("generates breadcrumbs correctly", async () => {
      const engine = new BreadcrumbEngine()
      const result = await engine.generateBreadcrumbs("/products/electronics/phones")
      
      expect(result).toHaveLength(4)
      expect(result[0].label).toBe("Home")
      expect(result[0].href).toBe("/")
      expect(result[1].label).toBe("Products")
      expect(result[2].label).toBe("Electronics")
      expect(result[3].label).toBe("Phones")
      expect(result[3].current).toBe(true)
    })

    test("handles root path", async () => {
      const engine = new BreadcrumbEngine()
      const result = await engine.generateBreadcrumbs("/")
      expect(result).toHaveLength(0) // By default, no breadcrumb on home
    })

    test("shows breadcrumb on home when configured", async () => {
      const engine = new BreadcrumbEngine()
      const result = await engine.generateBreadcrumbs("/", { showOnHome: true })
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe("Home")
      expect(result[0].current).toBe(true)
    })

    test("filters locale segments", async () => {
      const engine = new BreadcrumbEngine({
        locales: ["en", "es", "fr"]
      })
      const result = await engine.generateBreadcrumbs("/en/products/electronics")
      
      expect(result).toHaveLength(3) // Should exclude 'en'
      expect(result[0].label).toBe("Home")
      expect(result[1].label).toBe("Products")
      expect(result[2].label).toBe("Electronics")
    })

    test("handles custom routes", async () => {
      const engine = new BreadcrumbEngine()
      const result = await engine.generateBreadcrumbs("/products/123", {
        customRoutes: {
          "products": { label: "Our Products" },
          "123": { label: "iPhone 15 Pro" }
        }
      })
      
      expect(result[1].label).toBe("Our Products")
      expect(result[2].label).toBe("iPhone 15 Pro")
    })

    test("cache functionality", async () => {
      const engine = new BreadcrumbEngine({ enableCache: true })
      
      // First call
      const start1 = performance.now()
      const result1 = await engine.generateBreadcrumbs("/products/test")
      const time1 = performance.now() - start1
      
      // Second call (should use cache)
      const start2 = performance.now()
      const result2 = await engine.generateBreadcrumbs("/products/test")
      const time2 = performance.now() - start2
      
      expect(result1).toEqual(result2)
      // Cache should be same or faster
      expect(time2).toBeLessThanOrEqual(time1 + 1) // +1ms tolerance
    })
  })

  describe("RouteFormatter", () => {
    test("creates formatter instance", () => {
      const formatter = new RouteFormatter()
      expect(formatter).toBeDefined()
    })

    test("formats segments correctly", () => {
      const formatter = new RouteFormatter()
      const context = {
        pathname: "/test",
        segments: ["test"],
        index: 0
      }
      
      const result = formatter.formatSegment("hello-world", context)
      expect(result).toBe("Hello World")
    })

    test("handles translations", () => {
      const formatter = new RouteFormatter({ home: "Casa" })
      expect(formatter.getTranslation("home")).toBe("Casa")
      expect(formatter.getTranslation("unknown")).toBe("unknown")
    })

    test("truncates labels", () => {
      const formatter = new RouteFormatter()
      const longLabel = "this-is-a-very-long-label-that-needs-truncation"
      const truncated = formatter.truncateLabel(longLabel, 20)
      expect(truncated).toBe("this-is-a-very-lo...")
      expect(truncated.length).toBe(20)
    })
  })

  describe("SegmentDetector", () => {
    test("creates detector instance", () => {
      const detector = new SegmentDetector()
      expect(detector).toBeDefined()
    })

    test("detects dynamic segments", () => {
      const detector = new SegmentDetector()
      
      // UUID detection
      expect(detector.isDynamic("123e4567-e89b-12d3-a456-426614174000")).toBe(true)
      
      // MongoDB ObjectId detection
      expect(detector.isDynamic("507f1f77bcf86cd799439011")).toBe(true)
      
      // Numeric ID detection
      expect(detector.isDynamic("12345")).toBe(true)
      
      // Static routes should not be dynamic
      expect(detector.isDynamic("products", ["products", "categories"])).toBe(false)
    })

    test("formats dynamic segments", () => {
      const detector = new SegmentDetector()
      
      // Slug formatting
      expect(detector.formatDynamicSegment("luxury-smartphone-pro")).toBe("Luxury Smartphone Pro")
      
      // Short segment
      expect(detector.formatDynamicSegment("test")).toBe("test")
    })

    test("gets segment types", () => {
      const detector = new SegmentDetector()
      
      const uuidType = detector.getSegmentType("123e4567-e89b-12d3-a456-426614174000")
      expect(uuidType?.name).toBe("uuid")
      
      const numericType = detector.getSegmentType("12345")
      expect(numericType?.name).toBe("numericId")
    })
  })

  describe("Utility Functions", () => {
    test("formatBreadcrumbsForSchema", () => {
      const breadcrumbs = [
        { id: "1", label: "Home", href: "/", current: false },
        { id: "2", label: "Products", href: "/products", current: true }
      ]
      
      const schema = formatBreadcrumbsForSchema(breadcrumbs)
      
      expect(schema["@context"]).toBe("https://schema.org")
      expect(schema["@type"]).toBe("BreadcrumbList")
      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
    })

    test("validateConfig", () => {
      const validConfig = {
        showOnHome: true,
        maxSlugLength: 30,
        animations: { enabled: true, type: "fade" as const }
      }
      
      const result = validateConfig(validConfig)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test("validateConfig with errors", () => {
      const invalidConfig = {
        maxSlugLength: -1,
        animations: { type: "invalid" as "fade" } // Invalid animation type for testing
      }
      
      const result = validateConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    test("toTitleCase", () => {
      expect(toTitleCase("hello-world")).toBe("Hello World")
      expect(toTitleCase("some_snake_case")).toBe("Some Snake Case")
      expect(toTitleCase("multiple  spaces")).toBe("Multiple Spaces")
    })

    test("formatSegmentLabel", () => {
      expect(formatSegmentLabel("")).toBe("")
      expect(formatSegmentLabel("index")).toBe("Home")
      expect(formatSegmentLabel("123")).toBe("Item #123")
      expect(formatSegmentLabel("product-name")).toBe("Product Name")
      
      // UUID
      expect(formatSegmentLabel("123e4567-e89b-12d3-a456-426614174000")).toBe("Item Details")
      
      // MongoDB ObjectId
      expect(formatSegmentLabel("507f1f77bcf86cd799439011")).toBe("Details")
    })
  })

  describe("Integration Tests", () => {
    test("complete workflow with custom configuration", async () => {
      const engine = new BreadcrumbEngine({
        locales: ["en", "fr"],
        restrictedRoutes: ["admin"],
        staticRoutes: ["products", "categories", "blog"],
        maxSlugLength: 25,
        enableCache: true
      })

      const result = await engine.generateBreadcrumbs("/en/products/luxury-gaming-laptop", {
        customRoutes: {
          "products": { 
            label: "All Products"
          }
        }
      })

      expect(result).toHaveLength(3)
      expect(result[0].label).toBe("Home") // Default home label
      expect(result[1].label).toBe("All Products") // Custom route
      expect(result[2].label).toBe("Luxury Gaming Laptop") // Formatted dynamic segment
      
      // Test that locale was filtered out
      const allSegments = result.map(item => item.href)
      expect(allSegments).toEqual(["/", "/products", "/products/luxury-gaming-laptop"])
    })

    test("async route resolution", async () => {
      const engine = new BreadcrumbEngine()
      
      const mockResolver = jest.fn().mockResolvedValue({
        label: "MacBook Pro 16-inch"
      })

      const result = await engine.generateBreadcrumbs("/products/123", {
        customRoutes: {
          "123": {
            label: "Product",
            async: true,
            resolver: mockResolver
          }
        }
      })

      expect(mockResolver).toHaveBeenCalled()
      expect(result[2].label).toBe("MacBook Pro 16-inch")
    })
  })
})