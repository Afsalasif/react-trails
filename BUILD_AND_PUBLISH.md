# 🚀 Build and Publish Guide - Personal

Quick reference for building and publishing `react-trails` to NPM.

## Prerequisites

- NPM account: `afzalmoh`
- Package name: `react-trails`
- Author: `afzalmoh`

## Step-by-Step Process

### 1. Pre-Build Checks

```bash
# Make sure everything works
npm test

# Type check
npm run typecheck

# Lint code
npm run lint
```

### 2. Build the Package

```bash
# Build for production
npm run build

# Verify build output
ls dist/
```

### 3. Version Management

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm version patch

# For new features (1.0.0 → 1.1.0)
npm version minor

# For breaking changes (1.0.0 → 2.0.0)
npm version major
```

### 4. NPM Login (First time only)

```bash
npm login
```

Enter your credentials:
- Username: `afzalmoh`
- Password: [your password]
- Email: [your email]

### 5. Test Package Locally (Optional)

```bash
# Create test package
npm pack

# This creates: react-trails-x.x.x.tgz
```

### 6. Publish to NPM

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# Actual publish
npm publish
```

### 7. Verify Publication

```bash
# Check if published successfully
npm info react-trails

# Or visit: https://www.npmjs.com/package/react-trails
```

## Quick Commands

```bash
# Full publish workflow
npm test && npm run build && npm version patch && npm publish

# Check current version
npm version

# View package info
npm info react-trails version
```

## Troubleshooting

### Package name already exists
```bash
# Check if name is taken
npm info react-trails

# If taken, update package.json with different name
```

### Authentication issues
```bash
# Re-login
npm logout
npm login
```

### Version conflicts
```bash
# Check current published version
npm view react-trails version

# Update to higher version
npm version patch
```

## Notes

- Package will be publicly available at: `https://www.npmjs.com/package/react-trails`
- Users can install with: `npm install react-trails`
- Make sure `package.json` has correct author: `"author": "afzalmoh"`