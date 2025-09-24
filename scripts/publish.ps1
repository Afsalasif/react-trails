# Publishing script for Windows PowerShell
param(
    [string]$ReleaseType = "patch", # patch, minor, major, prerelease
    [string]$PreId = "alpha",       # alpha, beta, rc
    [switch]$DryRun = $false,
    [switch]$SkipGit = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Publishing React Dynamic Breadcrumb..." -ForegroundColor Cyan

try {
    # 1. Validate everything first
    Write-Host "`n🧪 Running comprehensive validation..." -ForegroundColor Yellow
    & "$PSScriptRoot\validate.ps1"
    if ($LASTEXITCODE -ne 0) { throw "Validation failed" }
    Write-Host "✅ Validation passed" -ForegroundColor Green

    # 2. Build for production
    Write-Host "`n🔨 Building for production..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Host "✅ Build successful" -ForegroundColor Green

    # 3. Update version
    Write-Host "`n📝 Updating version ($ReleaseType)..." -ForegroundColor Yellow
    if ($ReleaseType -eq "prerelease") {
        npm version prerelease --preid=$PreId
    } else {
        npm version $ReleaseType
    }
    if ($LASTEXITCODE -ne 0) { throw "Version update failed" }
    
    $NewVersion = (npm pkg get version).Trim('"')
    Write-Host "✅ Version updated to $NewVersion" -ForegroundColor Green

    # 4. Git operations (unless skipped)
    if (-not $SkipGit) {
        Write-Host "`n📚 Creating git commit and tag..." -ForegroundColor Yellow
        
        git add .
        git commit -m "Release v$NewVersion"
        if ($LASTEXITCODE -ne 0) { throw "Git commit failed" }
        
        git tag "v$NewVersion"
        if ($LASTEXITCODE -ne 0) { throw "Git tag creation failed" }
        
        Write-Host "✅ Git commit and tag created" -ForegroundColor Green
    }

    # 5. Publish to npm
    Write-Host "`n📦 Publishing to npm..." -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN - would publish:" -ForegroundColor Magenta
        npm publish --dry-run
    } else {
        # Check if user is logged in
        $npmUser = npm whoami 2>$null
        if (-not $npmUser) {
            Write-Host "⚠️  Not logged in to npm. Please run 'npm login' first." -ForegroundColor Red
            throw "Not logged in to npm"
        }
        
        Write-Host "📤 Publishing as user: $npmUser" -ForegroundColor Cyan
        
        if ($ReleaseType -eq "prerelease") {
            npm publish --tag $PreId --access public
        } else {
            npm publish --access public
        }
        
        if ($LASTEXITCODE -ne 0) { throw "npm publish failed" }
        Write-Host "✅ Published to npm successfully" -ForegroundColor Green
    }

    # 6. Push to git (unless skipped or dry run)
    if (-not $SkipGit -and -not $DryRun) {
        Write-Host "`n🌐 Pushing to git repository..." -ForegroundColor Yellow
        
        git push origin main --tags
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "⚠️  Git push failed, but package was published successfully" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Pushed to git repository" -ForegroundColor Green
        }
    }

    # 7. Success message
    Write-Host "`n🎉 Successfully published React Dynamic Breadcrumb v$NewVersion!" -ForegroundColor Green
    Write-Host "📦 Package: @your-org/react-trails" -ForegroundColor Cyan
    Write-Host "🔗 View on npm: https://www.npmjs.com/package/@your-org/react-trails" -ForegroundColor Cyan
    
    if (-not $DryRun) {
        Write-Host "`n📊 Post-publish verification:" -ForegroundColor Yellow
        Start-Sleep 5  # Wait for npm to propagate
        
        $publishedInfo = npm view @your-org/react-trails version 2>$null
        if ($publishedInfo -eq $NewVersion) {
            Write-Host "✅ Package is available on npm registry" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Package may still be propagating to npm registry" -ForegroundColor Yellow
        }
    }

} catch {
    Write-Host "`n❌ Publishing failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔄 To retry publishing:" -ForegroundColor Yellow
    Write-Host "  1. Fix the issue above" -ForegroundColor White
    Write-Host "  2. Run: .\scripts\publish.ps1" -ForegroundColor White
    exit 1
}

Write-Host "`n✨ Publishing complete!" -ForegroundColor Green