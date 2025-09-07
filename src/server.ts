import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from './browser/manager.js';
import { navigateTool, handleNavigate } from './tools/navigate.js';
import { analyzePageTool, handleAnalyzePage } from './tools/analyze.js';
import { extractTextTool, handleExtractText } from './tools/extract.js';
import { getElementsTool, handleGetElements } from './tools/elements.js';

class BrowserMCPServer {
  private server: Server;
  private browserManager: BrowserManager;

  constructor() {
    this.server = new Server(
      {
        name: 'browser-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.browserManager = new BrowserManager();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          navigateTool,
          analyzePageTool,
          extractTextTool,
          getElementsTool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'browser_navigate':
            const navigateResult = await handleNavigate(args, this.browserManager);
            return {
              content: [{ type: 'text', text: navigateResult }],
            };

          case 'browser_analyze_page':
            const analyzeResult = await handleAnalyzePage(args, this.browserManager);
            return {
              content: [{ type: 'text', text: analyzeResult }],
            };

          case 'browser_extract_text':
            const extractResult = await handleExtractText(args, this.browserManager);
            return {
              content: [{ type: 'text', text: extractResult }],
            };

          case 'browser_get_elements':
            const elementsResult = await handleGetElements(args, this.browserManager);
            return {
              content: [{ type: 'text', text: elementsResult }],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({ 
              success: false, 
              error: errorMessage 
            }, null, 2) 
          }],
          isError: true,
        };
      }
    });

    // Cleanup on exit
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup(): Promise<void> {
    try {
      await this.browserManager.close();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Browser MCP Server started');
  }
}

export { BrowserMCPServer };