#!/usr/bin/env node

import { BrowserMCPServer } from './server.js';

async function main() {
  const server = new BrowserMCPServer();
  await server.start();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down Browser MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down Browser MCP Server...');
  process.exit(0);
});

main().catch(console.error);