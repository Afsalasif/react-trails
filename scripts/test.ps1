# Comprehensive test runner for React Dynamic Breadcrumb
param(
    [string]$TestType = "all", # all, unit, integration, performance, api
    [switch]$Coverage = $false,
    [switch]$Watch = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🧪 Running React Dynamic Breadcrumb Tests..." -ForegroundColor Cyan

try {
    # Base jest arguments
    $jestArgs = @("--colors", "--passWithNoTests")
    
    if ($Coverage) {
        $jestArgs += "--coverage"
    }
    
    if ($Watch) {
        $jestArgs += "--watch"
    } else {
        $jestArgs += "--watchAll=false"
    }
    
    if ($Verbose) {
        $jestArgs += "--verbose"
    }

    switch ($TestType.ToLower()) {
        "unit" {
            Write-Host "🔬 Running Unit Tests..." -ForegroundColor Yellow
            $jestArgs += "--testPathPattern=(components|core|hooks|utils)"
        }
        "integration" {
            Write-Host "🔗 Running Integration Tests..." -ForegroundColor Yellow
            $jestArgs += "--testPathPattern=integration"
        }
        "performance" {
            Write-Host "⚡ Running Performance Tests..." -ForegroundColor Yellow
            $jestArgs += "--testPathPattern=performance"
            $jestArgs += "--runInBand"  # Run performance tests sequentially
        }
        "api" {
            Write-Host "🔌 Running API Tests..." -ForegroundColor Yellow
            $jestArgs += "--testPathPattern=api"
        }
        "all" {
            Write-Host "🎯 Running All Tests..." -ForegroundColor Yellow
            # No additional filters
        }
        default {
            Write-Host "❌ Invalid test type: $TestType" -ForegroundColor Red
            Write-Host "Valid options: all, unit, integration, performance, api" -ForegroundColor Yellow
            exit 1
        }
    }

    # Run Jest with arguments
    Write-Host "📋 Command: npm test -- $($jestArgs -join ' ')" -ForegroundColor Gray
    
    $npmArgs = @("test", "--") + $jestArgs
    & npm @npmArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed"
    }

    Write-Host "`n✅ All tests passed successfully!" -ForegroundColor Green
    
    if ($Coverage) {
        Write-Host "`n📊 Coverage report available at: coverage/lcov-report/index.html" -ForegroundColor Cyan
    }

} catch {
    Write-Host "`n❌ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔧 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Check if all dependencies are installed: npm install" -ForegroundColor White
    Write-Host "  2. Clear Jest cache: npx jest --clearCache" -ForegroundColor White
    Write-Host "  3. Run TypeScript compilation: npm run typecheck" -ForegroundColor White
    exit 1
}

Write-Host "`n🎉 Testing complete!" -ForegroundColor Green