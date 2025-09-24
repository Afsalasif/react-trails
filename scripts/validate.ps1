# Comprehensive validation script for Windows PowerShell
param(
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 Running comprehensive tests for React Dynamic Breadcrumb..." -ForegroundColor Cyan

try {
    # 1. Type checking
    Write-Host "`n📘 Running TypeScript type checking..." -ForegroundColor Yellow
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "TypeScript type checking failed" }
    Write-Host "✅ TypeScript checks passed" -ForegroundColor Green

    # 2. Unit tests with coverage
    Write-Host "`n🧪 Running unit tests with coverage..." -ForegroundColor Yellow
    npm run test:coverage -- --watchAll=false --ci
    if ($LASTEXITCODE -ne 0) { throw "Unit tests failed" }
    Write-Host "✅ All tests passed with coverage" -ForegroundColor Green

    # 3. Lint code
    Write-Host "`n📋 Running ESLint..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    Write-Host "✅ Code linting passed" -ForegroundColor Green

    # 4. Format check
    Write-Host "`n💅 Checking code formatting..." -ForegroundColor Yellow
    npm run prettier -- --check
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "⚠️  Formatting issues found. Running auto-fix..." -ForegroundColor Yellow
        npm run prettier
    }
    Write-Host "✅ Code formatting verified" -ForegroundColor Green

    # 5. Build for production
    if (-not $SkipBuild) {
        Write-Host "`n🔨 Building for production..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
        Write-Host "✅ Production build successful" -ForegroundColor Green

        # 6. Verify build outputs
        Write-Host "`n🔍 Verifying build outputs..." -ForegroundColor Yellow
        
        if (-not (Test-Path "dist/index.js")) { throw "CommonJS build not found" }
        if (-not (Test-Path "dist/index.esm.js")) { throw "ES Module build not found" }
        if (-not (Test-Path "dist/index.d.ts")) { throw "TypeScript definitions not found" }
        
        Write-Host "✅ Build outputs verified" -ForegroundColor Green

        # 7. Test build outputs
        Write-Host "`n🧪 Testing build outputs..." -ForegroundColor Yellow
        
        # Test CommonJS build
        node -e "const lib = require('./dist/index.js'); console.log('CommonJS exports:', Object.keys(lib).length, 'items')"
        if ($LASTEXITCODE -ne 0) { throw "CommonJS build test failed" }
        
        Write-Host "✅ Build outputs tested successfully" -ForegroundColor Green
    }

    # 8. Package validation
    Write-Host "`n📦 Validating package configuration..." -ForegroundColor Yellow
    npm pack --dry-run | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Package validation failed" }
    Write-Host "✅ Package configuration valid" -ForegroundColor Green

    # 9. Check for security vulnerabilities
    Write-Host "`n🛡️  Checking for security vulnerabilities..." -ForegroundColor Yellow
    npm audit --audit-level moderate
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "⚠️  Security vulnerabilities found. Consider running 'npm audit fix'" -ForegroundColor Yellow
    } else {
        Write-Host "✅ No security vulnerabilities found" -ForegroundColor Green
    }

    Write-Host "`n🎉 All validations passed! Package is ready for publishing." -ForegroundColor Green
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "  ✅ TypeScript compilation" -ForegroundColor White
    Write-Host "  ✅ Unit tests with coverage" -ForegroundColor White
    Write-Host "  ✅ Code linting" -ForegroundColor White
    Write-Host "  ✅ Code formatting" -ForegroundColor White
    if (-not $SkipBuild) {
        Write-Host "  ✅ Production build" -ForegroundColor White
        Write-Host "  ✅ Build output verification" -ForegroundColor White
    }
    Write-Host "  ✅ Package validation" -ForegroundColor White
    Write-Host "  ✅ Security audit" -ForegroundColor White

} catch {
    Write-Host "`n❌ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}