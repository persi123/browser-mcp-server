# Publishing Browser MCP Server

## Prerequisites

1. **NPM Account**: Create account at [npmjs.com](https://www.npmjs.com)
2. **Login to NPM**: `npm login`
3. **GitHub Account**: For repository hosting

## Publishing Steps

### Step 1: Prepare Package
```bash
# Build the package
npm run build

# Verify package contents
npm pack --dry-run

# Check package size and files
npm pack
tar -tzf prashanttongra-browser-mcp-server-1.0.0.tgz
rm *.tgz
```

### Step 2: Create GitHub Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Browser MCP Server"

# Create repo on GitHub: https://github.com/new
# Then connect local to remote:
git remote add origin https://github.com/prashanttongra/browser-mcp-server.git
git branch -M main
git push -u origin main
```

### Step 3: Publish to NPM
```bash
# Login to NPM
npm login

# Publish (first time)
npm publish --access public

# For updates (increment version first)
npm version patch  # or minor/major
npm publish
```

### Step 4: Test Installation
```bash
# Test installation in new directory
mkdir test-install && cd test-install
npm init -y
npm install @prashanttongra/browser-mcp-server

# Verify it works
node -e "console.log(require('@prashanttongra/browser-mcp-server'))"
```

## Alternative Publishing Options

### GitHub Packages
```bash
# Login to GitHub Packages
npm login --registry=https://npm.pkg.github.com

# Update package.json name to include @username
# Then publish
npm publish --registry=https://npm.pkg.github.com
```

### Private NPM Registry (Verdaccio)
```bash
# Install and run Verdaccio
npm install -g verdaccio
verdaccio

# Publish to local registry
npm publish --registry http://localhost:4873
```

## CI/CD Setup (Optional)

### GitHub Actions for Auto-Publishing
Create `.github/workflows/publish.yml`:
```yaml
name: Publish Package
on:
  release:
    types: [created]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Usage After Publishing

### Installation
```bash
npm install @prashanttongra/browser-mcp-server
```

### Claude Desktop Config
```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["@prashanttongra/browser-mcp-server"]
    }
  }
}
```

### Local Development
```bash
npm link @prashanttongra/browser-mcp-server
```

## Version Management

### Semantic Versioning
```bash
npm version patch   # 1.0.0 → 1.0.1 (bug fixes)
npm version minor   # 1.0.1 → 1.1.0 (new features)
npm version major   # 1.1.0 → 2.0.0 (breaking changes)
```

### Publishing Updates
```bash
# Update version and publish
npm version patch && npm publish
```

## Troubleshooting

### Common Issues
```bash
# Package name already exists
# Solution: Change package name in package.json

# Not logged in
npm login

# 2FA required
npm publish --otp=123456

# Permission denied
npm publish --access public
```

### Unpublishing (if needed)
```bash
# Unpublish within 72 hours
npm unpublish @prashanttongra/browser-mcp-server@1.0.0

# Deprecate instead (recommended)
npm deprecate @prashanttongra/browser-mcp-server@1.0.0 "Use version 1.0.1 instead"
```