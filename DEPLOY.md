# Deployment Guide

## 🚀 Quick Deploy & Publish

### Step 1: Create GitHub Repository
```bash
# Go to https://github.com/new
# Repository name: browser-mcp-server
# Set to Public
# Don't initialize with README (we already have files)

# Then connect your local repo:
git remote add origin https://github.com/prashanttongra/browser-mcp-server.git
git branch -M main
git push -u origin main
```

### Step 2: Publish to NPM
```bash
# Login to NPM (create account at npmjs.com if needed)
npm login

# Publish the package
npm publish --access public

# ✅ Your package is now available at:
# https://www.npmjs.com/package/@prashanttongra/browser-mcp-server
```

### Step 3: Test Installation
```bash
# Test in a new directory
mkdir test-mcp && cd test-mcp
npm install @prashanttongra/browser-mcp-server
npx playwright install chromium

# Test it works
node -e "
const { BrowserManager } = require('@prashanttongra/browser-mcp-server/dist/browser/manager');
console.log('✅ Package installed successfully!');
"
```

## 🧪 Testing Your Published Package

### Test with Claude Desktop
1. Add to your config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

2. Restart Claude Desktop

3. Test with: *"Navigate to https://example.com and analyze the page structure"*

### Test with Local Project
```bash
# In any project
npm install @prashanttongra/browser-mcp-server
npx playwright install chromium

# Create test file
cat > test-browser-mcp.js << 'EOF'
const { BrowserManager } = require('@prashanttongra/browser-mcp-server/dist/browser/manager');
const { handleNavigate, handleAnalyzePage } = require('@prashanttongra/browser-mcp-server/dist/tools/navigate');

async function test() {
  const browser = new BrowserManager();
  try {
    console.log('🔗 Navigating to example.com...');
    const navResult = await handleNavigate({ url: 'https://example.com' }, browser);
    console.log('Navigation:', JSON.parse(navResult));
    
    console.log('🔍 Analyzing page...');
    const analysis = await handleAnalyzePage({ includeContent: true }, browser);
    console.log('Analysis:', JSON.parse(analysis));
  } finally {
    await browser.close();
  }
}

test().catch(console.error);
EOF

node test-browser-mcp.js
```

## 🔄 Updates & Maintenance

### Publishing Updates
```bash
# Make your changes, then:
npm version patch  # 1.0.0 → 1.0.1
npm publish

# Or for bigger changes:
npm version minor  # 1.0.1 → 1.1.0
npm publish
```

### Check Package Stats
- NPM page: https://www.npmjs.com/package/@prashanttongra/browser-mcp-server
- Download stats: `npm info @prashanttongra/browser-mcp-server`
- GitHub repo: https://github.com/prashanttongra/browser-mcp-server

## 🌐 Usage Examples for Users

Once published, users can:

### Install and Use
```bash
npm install @prashanttongra/browser-mcp-server
```

### Claude Desktop Integration
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

### Programmatic Usage
```javascript
const browserMCP = require('@prashanttongra/browser-mcp-server');
// Use in your own applications
```

## 📊 Monitoring

### Check if it's working
```bash
# Test the published package
npm install -g @prashanttongra/browser-mcp-server
npx @prashanttongra/browser-mcp-server --help
```

### View package info
```bash
npm view @prashanttongra/browser-mcp-server
npm view @prashanttongra/browser-mcp-server versions --json
```

---

**Your Browser MCP Server is ready to help AI agents understand the web! 🤖🌐**