import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from '../browser/manager.js';
import { NavigateArgsSchema } from '../types.js';

export const navigateTool: Tool = {
  name: 'browser_navigate',
  description: 'Navigate to a specific URL in the browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'The URL to navigate to'
      }
    },
    required: ['url']
  }
};

export async function handleNavigate(
  args: unknown,
  browserManager: BrowserManager
): Promise<string> {
  const { url } = NavigateArgsSchema.parse(args);
  
  try {
    await browserManager.navigateToUrl(url);
    const title = await browserManager.getPageTitle();
    const currentUrl = await browserManager.getPageUrl();
    
    return JSON.stringify({
      success: true,
      url: currentUrl,
      title,
      message: `Successfully navigated to ${url}`
    }, null, 2);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Navigation failed',
      url
    }, null, 2);
  }
}