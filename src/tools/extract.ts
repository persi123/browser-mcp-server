import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from '../browser/manager.js';
import { ExtractTextArgsSchema } from '../types.js';

export const extractTextTool: Tool = {
  name: 'browser_extract_text',
  description: 'Extract text content from the current page or specific elements using CSS selectors',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector to target specific elements (optional, extracts all text if not provided)'
      },
      includeHidden: {
        type: 'boolean',
        description: 'Include text from hidden elements',
        default: false
      }
    }
  }
};

export async function handleExtractText(
  args: unknown,
  browserManager: BrowserManager
): Promise<string> {
  const { selector, includeHidden } = ExtractTextArgsSchema.parse(args);
  
  try {
    const page = await browserManager.getCurrentPage();
    
    const result = await page.evaluate(({ selector, includeHidden }) => {
      if (selector) {
        // Extract text from specific elements
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => {
          const element = el as HTMLElement;
          if (!includeHidden) {
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
              return null;
            }
          }
          return {
            tag: element.tagName.toLowerCase(),
            text: element.textContent?.trim() || '',
            attributes: {
              id: element.id || undefined,
              class: element.className || undefined,
              role: element.getAttribute('role') || undefined
            }
          };
        }).filter(item => item && item.text);
      } else {
        // Extract all visible text content
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              
              if (!includeHidden) {
                const computedStyle = window.getComputedStyle(parent);
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                  return NodeFilter.FILTER_REJECT;
                }
              }
              
              // Skip script and style elements
              const tagName = parent.tagName.toLowerCase();
              if (['script', 'style', 'noscript'].includes(tagName)) {
                return NodeFilter.FILTER_REJECT;
              }
              
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        
        const textNodes: string[] = [];
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent?.trim();
          if (text && text.length > 0) {
            textNodes.push(text);
          }
        }
        
        return textNodes.join(' ').replace(/\s+/g, ' ').trim();
      }
    }, { selector, includeHidden });
    
    return JSON.stringify({
      success: true,
      selector: selector || 'all',
      content: result,
      summary: {
        type: selector ? 'elements' : 'full_page',
        count: Array.isArray(result) ? result.length : 1,
        totalLength: Array.isArray(result) ? 
          result.reduce((sum, item) => sum + (item?.text?.length || 0), 0) :
          (typeof result === 'string' ? result.length : 0)
      }
    }, null, 2);
    
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Text extraction failed',
      selector
    }, null, 2);
  }
}