# Browser MCP Server

A Model Context Protocol (MCP) server that enables AI agents to understand web page structure and content without screenshots. Built with Playwright for reliable browser automation.

## 🎯 Purpose

Solves the problem where AI agents give "wrong and random suggestions" about web pages by providing them with structured page data instead of requiring visual screenshots.

## ✨ Features

- 🔍 **Page Structure Analysis** - Understand layout, forms, and interactive elements
- 📄 **Smart Content Extraction** - Extract text using CSS selectors
- 🎯 **Element Discovery** - Find and analyze specific page elements with accessibility info
- 🚀 **Fast & Local** - Uses Playwright's accessibility tree (no screenshots needed)
- 🤖 **AI-Optimized** - Designed specifically for AI agent integration

## 📦 Installation

```bash
npm install @your-org/browser-mcp-server
```

## 🚀 Usage

### Claude Desktop Integration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["@your-org/browser-mcp-server"]
    }
  }
}
```

### VS Code + Copilot Chat

Configure in your VS Code MCP settings to use with Copilot Chat.

### Windsurf Integration

Add to your Windsurf MCP configuration.

### Local Development

```bash
# Link for local development
npm link @your-org/browser-mcp-server

# Use in your project
const browserMCP = require('@your-org/browser-mcp-server');
```

## 🛠️ Available Tools

### `browser_navigate`
Navigate to a URL and get page information.
```json
{
  "url": "https://example.com"
}
```

### `browser_analyze_page`
Get comprehensive page structure analysis.
```json
{
  "includeContent": true,
  "includeForms": true,
  "includeLinks": true,
  "maxDepth": 2
}
```

### `browser_extract_text`
Extract text content from page or specific elements.
```json
{
  "selector": "h1, h2, p",
  "includeHidden": false
}
```

### `browser_get_elements`
Find elements with detailed attributes and accessibility info.
```json
{
  "selector": "button, input, a[href]",
  "includeAttributes": true,
  "maxResults": 20
}
```

## 📋 Example AI Conversations

### Understanding Page Flow
```
Human: Go to https://github.com/login and help me understand the login process

AI: I'll navigate to the GitHub login page and analyze its structure.

[Uses browser_navigate and browser_analyze_page]

The login page has:
- 2 input fields: username/email and password (both required)
- 1 "Sign in" submit button
- Links for "Forgot password" and "Create account"
- Form submits to /session with POST method
- Additional 2FA field may appear after initial submission

The typical flow is: enter credentials → click Sign in → (optional 2FA) → redirect to dashboard.
```

### Content Extraction
```
Human: Extract all the main article titles from https://news.ycombinator.com

AI: [Uses browser_navigate and browser_extract_text with CSS selectors]

Found 30 article titles including:
1. "Show HN: My new startup idea"
2. "Why distributed systems are hard"
3. "The future of web development"
[etc...]
```

## 🔧 Development

```bash
# Clone and setup
git clone <your-repo>
cd browser-mcp-server
npm install

# Install browser
npx playwright install chromium

# Build
npm run build

# Test locally
npm start
```

## 🎯 Perfect For

- **AI Agents** that need to understand web page workflows
- **Automated Analysis** of website structure
- **Content Extraction** without visual parsing
- **Form Discovery** for automation planning
- **Accessibility Analysis** of web pages

## 🏗️ Architecture

```
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── server.ts         # MCP server implementation
│   ├── browser/          # Browser management
│   │   └── manager.ts    # Playwright browser lifecycle
│   ├── tools/            # MCP tools
│   │   ├── navigate.ts   # Page navigation
│   │   ├── analyze.ts    # Page structure analysis
│   │   ├── extract.ts    # Content extraction
│   │   └── elements.ts   # Element discovery
│   └── types.ts          # TypeScript definitions
```

## 🔒 Requirements

- Node.js 18+
- Chromium (auto-installed via Playwright)
- MCP-compatible AI agent (Claude Desktop, VS Code, Windsurf, etc.)

## 📜 License

MIT

---

**Built for AI agents to understand the web, not just see it.** 🤖🌐