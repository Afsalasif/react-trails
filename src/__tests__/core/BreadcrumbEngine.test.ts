import { BreadcrumbEngine } from '../../core/BreadcrumbEngine'
import { BreadcrumbConfig } from '../../types'

describe('BreadcrumbEngine', () => {
  let engine: BreadcrumbEngine
  let config: BreadcrumbConfig

  beforeEach(() => {
    config = {
      translations: {
        home: 'Home',
        details: 'Details'
      }
    }
    engine = new BreadcrumbEngine(config)
  })

  describe('generateBreadcrumbs', () => {
    it('returns empty array for home page by default', async () => {
      const result = await engine.generateBreadcrumbs('/')
      expect(result).toEqual([])
    })

    it('returns home item when showOnHome is true', async () => {
      const result = await engine.generateBreadcrumbs('/', { showOnHome: true })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        label: 'Home',
        href: '/',
        current: true
      })
    })

    it('generates correct breadcrumbs for nested path', async () => {
      const result = await engine.generateBreadcrumbs('/products/electronics/phones')
      
      expect(result).toHaveLength(4)
      expect(result[0]).toMatchObject({ label: 'Home', href: '/', current: false })
      expect(result[1]).toMatchObject({ label: 'Products', href: '/products', current: false })
      expect(result[2]).toMatchObject({ label: 'Electronics', href: '/products/electronics', current: false })
      expect(result[3]).toMatchObject({ label: 'Phones', href: '/products/electronics/phones', current: true })
    })

    it('filters out locale segments', async () => {
      const result = await engine.generateBreadcrumbs('/en/products/electronics', {
        engine: { locales: ['en', 'es', 'fr'] }
      })
      
      expect(result).toHaveLength(3)
      expect(result.map(b => b.label)).toEqual(['Home', 'Products', 'Electronics'])
    })

    it('handles restricted routes correctly', async () => {
      const result = await engine.generateBreadcrumbs('/products', {
        engine: { restrictedRoutes: ['products'] }
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].label).toBe('Home')
    })

    it('applies custom route configurations', async () => {
      const result = await engine.generateBreadcrumbs('/products/luxury-phone', {
        customRoutes: {
          'products': { 
            label: 'Our Products',
            icon: '🛍️' 
          }
        }
      })
      
      expect(result[1]).toMatchObject({
        label: 'Our Products',
        icon: '🛍️'
      })
    })

    it('formats dynamic segments correctly', async () => {
      const result = await engine.generateBreadcrumbs('/products/luxury-smartphone-pro')
      
      const productItem = result.find(item => item.href === '/products/luxury-smartphone-pro')
      expect(productItem?.label).toBe('Luxury Smartphone Pro')
    })

    it('handles async route resolvers', async () => {
      const mockResolver = jest.fn().mockResolvedValue({
        label: 'Resolved Product Name'
      })

      const result = await engine.generateBreadcrumbs('/products/123', {
        customRoutes: {
          '123': {
            label: 'Product',
            async: true,
            resolver: mockResolver
          }
        }
      })

      expect(mockResolver).toHaveBeenCalled()
      expect(result[2].label).toBe('Resolved Product Name')
    })

    it('uses cache when enabled', async () => {
      const spy = jest.spyOn(engine, 'generateBreadcrumbs')
      
      await engine.generateBreadcrumbs('/products')
      await engine.generateBreadcrumbs('/products') // Should use cache
      
      expect(spy).toHaveBeenCalledTimes(2)
    })

  it('applies plugins correctly', async () => {
    const beforeGeneratePlugin = jest.fn()
    const afterGeneratePlugin = jest.fn().mockImplementation(breadcrumbs => breadcrumbs)
    
    const result = await engine.generateBreadcrumbs('/dashboard/settings', {
      plugins: [{
        name: 'test',
        beforeGenerate: beforeGeneratePlugin,
        afterGenerate: afterGeneratePlugin
      }]
    })

    expect(beforeGeneratePlugin).toHaveBeenCalledWith('/dashboard/settings', expect.any(Object))
    expect(afterGeneratePlugin).toHaveBeenCalledWith(expect.any(Array), expect.any(Object))
    expect(result).toEqual(expect.any(Array))
  })
  })
})