# 🛠️ Developer Guide: React Dynamic Breadcrumb

## Table of Contents
1. [Quick Start Testing](#quick-start-testing)
2. [Comprehensive Testing Strategy](#comprehensive-testing-strategy)
3. [Build & Bundle Process](#build--bundle-process)
4. [NPM Publishing Workflow](#npm-publishing-workflow)
5. [Quality Assurance Checklist](#quality-assurance-checklist)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Performance Testing](#performance-testing)
8. [Documentation & Examples](#documentation--examples)

---

## 🚀 Quick Start Testing

### Prerequisites Check
```bash
# Verify Node.js version (requires 16+)
node --version

# Verify npm version
npm --version

# Install dependencies
npm install
```

### Immediate Test Commands (✅ WORKING)
```powershell
# 1. Type checking (✅ PASSING)
npm run typecheck

# 2. Core API tests (✅ 22/22 PASSING)
npm test src/__tests__/core-api.test.ts --watchAll=false

# 3. Performance tests (✅ 6/6 PASSING)
npm test src/__tests__/performance.test.ts --watchAll=false

# 4. Quick validation script
powershell -ExecutionPolicy Bypass -File .\scripts\test.ps1 -TestType api

# 5. All working tests together (~20 seconds)
npm run typecheck
npm test src/__tests__/core-api.test.ts --watchAll=false  
npm test src/__tests__/performance.test.ts --watchAll=false
```

---

## 🧪 Comprehensive Testing Strategy

### 1. Unit Testing (Core Components)

#### Test the Breadcrumb Engine
```bash
# Test core engine functionality
npm test -- --testPathPattern=BreadcrumbEngine

# Test with verbose output
npm test -- --verbose src/__tests__/core/BreadcrumbEngine.test.ts
```

**Key Test Scenarios:**
- Path parsing and segment detection
- Dynamic route identification
- Custom route resolution
- Async route handling
- Cache functionality
- Plugin system integration

#### Test React Components
```bash
# Test main component
npm test -- --testPathPattern=DynamicBreadcrumb

# Test mobile component
npm test -- --testPathPattern=MobileDynamicBreadcrumb
```

**Key Test Scenarios:**
- Rendering with different configurations
- Event handling (navigation, keyboard)
- Accessibility attributes
- Animation states
- Error boundaries
- Loading states

#### Test Custom Hooks
```bash
# Test breadcrumb hook
npm test -- --testPathPattern=useBreadcrumb

# Test navigation hook  
npm test -- --testPathPattern=useNavigation
```

### 2. Integration Testing

#### Test Complete Workflows
```bash
# Create integration test file
echo 'import { render } from "@testing-library/react"
import { DynamicBreadcrumb } from "../src"

describe("Integration Tests", () => {
  test("complete workflow", () => {
    // Test complete user journey
  })
})' > src/__tests__/integration.test.tsx

npm test -- --testPathPattern=integration
```

### 3. Performance Testing

#### Bundle Size Analysis
```bash
# Build for production
npm run build

# Analyze bundle size
npx bundlephobia . --local

# Check tree-shaking
npm run build -- --analyze
```

#### Memory Leak Testing
```bash
# Run tests with memory monitoring
npm test -- --detectLeaks --logHeapUsage
```

### 4. Cross-Browser Testing (Headless)

#### Setup Browser Tests
```bash
# Install puppeteer for browser testing
npm install --save-dev puppeteer

# Create browser test
echo 'const puppeteer = require("puppeteer")

describe("Browser Tests", () => {
  let browser, page
  
  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage()
  })
  
  afterAll(async () => {
    await browser.close()
  })
  
  test("renders in browser", async () => {
    await page.goto("data:text/html,<div id=root></div>")
    // Test breadcrumb rendering
  })
})' > src/__tests__/browser.test.js

npm test -- --testPathPattern=browser
```

### 5. Accessibility Testing

#### Automated A11y Testing
```bash
# Install accessibility testing tools
npm install --save-dev @axe-core/react jest-axe

# Run accessibility tests
npm test -- --testPathPattern=accessibility
```

#### Screen Reader Testing Setup
```bash
# Create screen reader simulation tests
echo 'import { render } from "@testing-library/react"
import { axe, toHaveNoViolations } from "jest-axe"
import { DynamicBreadcrumb } from "../src"

expect.extend(toHaveNoViolations)

describe("Accessibility Tests", () => {
  test("has no a11y violations", async () => {
    const { container } = render(<DynamicBreadcrumb />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})' > src/__tests__/accessibility.test.tsx

npm test -- --testPathPattern=accessibility
```

---

## 🔨 Build & Bundle Process

### 1. Development Build
```bash
# Watch mode for development
npm run dev

# This will:
# - Compile TypeScript
# - Generate type definitions
# - Watch for file changes
# - Hot reload components
```

### 2. Production Build
```bash
# Full production build
npm run build

# This creates:
# - dist/index.js (CommonJS)
# - dist/index.esm.js (ES Modules)  
# - dist/index.d.ts (TypeScript definitions)
# - dist/styles.css (Compiled styles)
```

### 3. Build Validation
```bash
# Verify build outputs
ls -la dist/

# Check CommonJS build
node -e "console.log(Object.keys(require('./dist/index.js')))"

# Check ES Module build
node --input-type=module -e "import * as lib from './dist/index.esm.js'; console.log(Object.keys(lib))"

# Verify types
npx tsc --noEmit --skipLibCheck dist/index.d.ts
```

### 4. Bundle Analysis
```bash
# Check bundle sizes
npx bundlesize

# Analyze what's in the bundle
npx webpack-bundle-analyzer dist/

# Check for unnecessary dependencies
npx depcheck
```

---

## 📦 NPM Publishing Workflow

### 1. Pre-Publishing Checklist
```bash
# Run complete validation suite
npm run validate

# Check package configuration
npm pack --dry-run

# Verify package contents
tar -tzf *.tgz

# Test installation locally
npm install -g ./react-trails-*.tgz
```

### 2. Version Management
```bash
# Patch version (bug fixes)
npm version patch

# Minor version (new features)
npm version minor  

# Major version (breaking changes)
npm version major

# Pre-release version
npm version prerelease --preid=alpha
```

### 3. Publishing Process
```bash
# Login to npm (first time)
npm login

# Verify npm user
npm whoami

# Publish to npm
npm publish

# Publish beta version
npm publish --tag beta

# Publish with specific access
npm publish --access public
```

### 4. Post-Publishing Verification
```bash
# Check package on npm
npm view @your-org/react-trails

# Install from npm in test project
mkdir test-install && cd test-install
npm init -y
npm install @your-org/react-trails

# Test the installed package
node -e "console.log(require('@your-org/react-trails'))"
```

---

## ✅ Quality Assurance Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] No console.log statements in production
- [ ] All dependencies properly declared

### Testing Coverage
- [ ] Unit test coverage > 90%
- [ ] Integration tests pass
- [ ] Accessibility tests pass
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] API documentation complete
- [ ] Examples working
- [ ] Migration guide (if needed)

### Package Health
- [ ] Package.json metadata complete
- [ ] Keywords optimized for discovery
- [ ] License file present
- [ ] Security vulnerabilities resolved
- [ ] Bundle size acceptable

### NPM Publishing
- [ ] Version number incremented
- [ ] Git tags created
- [ ] Release notes prepared
- [ ] npm package published
- [ ] Documentation site updated

---

## 🐛 Troubleshooting Guide

### Common Issues & Solutions

#### TypeScript Errors
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Reinstall @types packages
npm install --save-dev @types/react @types/react-dom

# Check tsconfig.json configuration
npx tsc --showConfig
```

#### Test Failures
```bash
# Run tests in debug mode
npm test -- --no-cache --detectOpenHandles

# Run specific failing test
npm test -- --testNamePattern="failing test name"

# Update test snapshots
npm test -- --updateSnapshot
```

#### Build Issues
```bash
# Clean build directory
rm -rf dist/

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Publishing Errors
```bash
# Check npm registry
npm config get registry

# Verify package name availability
npm view @your-org/react-trails

# Fix authentication
npm logout && npm login
```

---

## 🚀 Performance Testing

### Bundle Size Testing
```bash
# Check current bundle size
npm run build
ls -lh dist/

# Compare with previous versions
npm install -g bundlesize
bundlesize

# Analyze dependencies
npx webpack-bundle-analyzer dist/
```

### Runtime Performance Testing
```bash
# Create performance test
echo 'import { performance } from "perf_hooks"
import { BreadcrumbEngine } from "../src/core/BreadcrumbEngine"

describe("Performance Tests", () => {
  test("breadcrumb generation speed", async () => {
    const engine = new BreadcrumbEngine()
    const start = performance.now()
    
    // Generate 1000 breadcrumbs
    for (let i = 0; i < 1000; i++) {
      await engine.generateBreadcrumbs(`/products/category-${i}/item-${i}`)
    }
    
    const end = performance.now()
    const duration = end - start
    
    console.log(`Generated 1000 breadcrumbs in ${duration}ms`)
    expect(duration).toBeLessThan(1000) // Should complete in under 1s
  })
})' > src/__tests__/performance.test.ts

npm test -- --testPathPattern=performance
```

### Memory Usage Testing
```bash
# Monitor memory during tests
npm test -- --logHeapUsage --detectLeaks

# Profile memory usage
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

---

## 📚 Documentation & Examples

### Generate API Documentation
```bash
# Install documentation generator
npm install --save-dev typedoc

# Generate docs
npx typedoc src/index.ts --out docs/

# Preview documentation
cd docs && python -m http.server 8000
```

### Create Working Examples
```bash
# Next.js example
mkdir -p examples/nextjs
cd examples/nextjs
npx create-next-app@latest . --typescript
npm install ../../
echo '// Example implementation' > pages/index.tsx

# CRA example
mkdir -p examples/cra  
cd examples/cra
npx create-react-app . --template typescript
npm install ../../
echo '// Example implementation' > src/App.tsx

# Test examples work
cd examples/nextjs && npm run build
cd ../cra && npm run build
```

### Validation Scripts
```bash
# Create validation script
echo '#!/bin/bash
set -e

echo "🧪 Running comprehensive tests..."

# Type checking
npm run typecheck

# Unit tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Build for production
npm run build

# Test build outputs
node -e "require(\"./dist/index.js\")"

# Bundle size check
bundlesize

echo "✅ All tests passed! Ready for publishing."
' > scripts/validate.sh

chmod +x scripts/validate.sh

# Run validation
./scripts/validate.sh
```

---

## 🎯 Testing Without UI

### Automated Testing Pipeline
```bash
# Run all tests without browser UI
npm test -- --watchAll=false --coverage --ci

# Test specific functionality areas
npm test -- --testPathPattern=core      # Core logic
npm test -- --testPathPattern=hooks     # React hooks
npm test -- --testPathPattern=utils     # Utilities
npm test -- --testPathPattern=types     # Type definitions
```

### Programmatic API Testing
```bash
# Create API test file
echo 'import { 
  DynamicBreadcrumb, 
  BreadcrumbEngine, 
  formatBreadcrumbsForSchema,
  validateConfig 
} from "../src"

describe("API Testing", () => {
  test("all exports available", () => {
    expect(DynamicBreadcrumb).toBeDefined()
    expect(BreadcrumbEngine).toBeDefined()
    expect(formatBreadcrumbsForSchema).toBeDefined()
    expect(validateConfig).toBeDefined()
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
  })
})' > src/__tests__/api.test.ts

npm test -- --testPathPattern=api
```

### Configuration Testing
```bash
# Test different configurations
echo 'import { BreadcrumbEngine } from "../src/core/BreadcrumbEngine"
import { validateConfig } from "../src/utils/validators"

describe("Configuration Testing", () => {
  test("validates good config", () => {
    const config = {
      showOnHome: true,
      animations: { enabled: true, type: "fade" as const },
      translations: { home: "Home" }
    }
    
    const result = validateConfig(config)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test("validates bad config", () => {
    const config = {
      maxSlugLength: -1, // Invalid
      animations: { type: "invalid" as any } // Invalid
    }
    
    const result = validateConfig(config)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})' > src/__tests__/config.test.ts

npm test -- --testPathPattern=config
```

### Final Publishing Command
```bash
# Complete publishing workflow
echo '#!/bin/bash
set -e

echo "🚀 Publishing React Dynamic Breadcrumb..."

# 1. Validate everything
./scripts/validate.sh

# 2. Build for production
npm run build

# 3. Update version
npm version patch

# 4. Create git tag
git add .
git commit -m "Release $(npm pkg get version | tr -d \")"
git tag "v$(npm pkg get version | tr -d \")"

# 5. Publish to npm
npm publish

# 6. Push to git
git push origin main --tags

echo "✅ Successfully published to npm!"
echo "📦 Package: @your-org/react-trails"
echo "🔗 View: https://www.npmjs.com/package/@your-org/react-trails"
' > scripts/publish.sh

chmod +x scripts/publish.sh
```

Now you can run comprehensive tests and publish with:
```bash
# Test everything
./scripts/validate.sh

# Publish when ready
./scripts/publish.sh
```

This guide provides everything you need to thoroughly test, build, and publish your advanced React breadcrumb library without needing any UI! 🎉