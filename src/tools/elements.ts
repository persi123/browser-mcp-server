import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from '../browser/manager.js';
import { GetElementsArgsSchema } from '../types.js';

export const getElementsTool: Tool = {
  name: 'browser_get_elements',
  description: 'Get detailed information about elements matching a CSS selector, useful for understanding page structure and interactive elements',
  inputSchema: {
    type: 'object',
    properties: {
      selector: {
        type: 'string',
        description: 'CSS selector to find elements'
      },
      includeAttributes: {
        type: 'boolean',
        description: 'Include element attributes in the response',
        default: true
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of elements to return',
        minimum: 1,
        maximum: 100,
        default: 20
      }
    },
    required: ['selector']
  }
};

export async function handleGetElements(
  args: unknown,
  browserManager: BrowserManager
): Promise<string> {
  const { selector, includeAttributes, maxResults } = GetElementsArgsSchema.parse(args);
  
  try {
    const page = await browserManager.getCurrentPage();
    
    const elements = await page.evaluate(({ selector, includeAttributes, maxResults }) => {
      const elements = document.querySelectorAll(selector);
      const results = Array.from(elements).slice(0, maxResults).map((element, index) => {
        const el = element as HTMLElement;
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        const result: any = {
          index,
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().slice(0, 200) || '',
          visible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
          position: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          }
        };
        
        if (includeAttributes) {
          const attributes: Record<string, string> = {};
          Array.from(el.attributes).forEach(attr => {
            attributes[attr.name] = attr.value;
          });
          result.attributes = attributes;
          
          // Add useful computed properties
          result.computedStyle = {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            cursor: computedStyle.cursor
          };
          
          // Add accessibility information
          result.accessibility = {
            role: el.getAttribute('role') || el.tagName.toLowerCase(),
            accessibleName: el.getAttribute('aria-label') || 
                           el.getAttribute('aria-labelledby') || 
                           el.getAttribute('title') ||
                           (el as HTMLInputElement).placeholder ||
                           el.textContent?.trim().slice(0, 50) || '',
            focusable: el.tabIndex >= 0 || ['input', 'button', 'select', 'textarea', 'a'].includes(el.tagName.toLowerCase()),
            disabled: (el as HTMLInputElement).disabled || el.getAttribute('aria-disabled') === 'true'
          };
        }
        
        // Add element-specific information
        if (el.tagName.toLowerCase() === 'a') {
          result.href = (el as HTMLAnchorElement).href;
        } else if (['input', 'select', 'textarea'].includes(el.tagName.toLowerCase())) {
          const input = el as HTMLInputElement;
          result.formElement = {
            type: input.type || 'text',
            name: input.name,
            value: input.value,
            placeholder: input.placeholder,
            required: input.required,
            disabled: input.disabled
          };
        } else if (el.tagName.toLowerCase() === 'button') {
          const button = el as HTMLButtonElement;
          result.button = {
            type: button.type || 'button',
            disabled: button.disabled,
            form: button.form?.id || null
          };
        }
        
        return result;
      });
      
      return results;
    }, { selector, includeAttributes, maxResults });
    
    return JSON.stringify({
      success: true,
      selector,
      elements,
      summary: {
        total: elements.length,
        visible: elements.filter(el => el.visible).length,
        interactive: elements.filter(el => 
          ['button', 'input', 'select', 'textarea', 'a'].includes(el.tag) ||
          el.accessibility?.focusable
        ).length
      }
    }, null, 2);
    
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Element query failed',
      selector
    }, null, 2);
  }
}