import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { BrowserManager } from '../browser/manager.js';
import { AnalyzePageArgsSchema, PageStructure, PageElement } from '../types.js';

export const analyzePageTool: Tool = {
  name: 'browser_analyze_page',
  description: 'Analyze the current page structure, forms, and interactive elements to help understand page flow and functionality',
  inputSchema: {
    type: 'object',
    properties: {
      includeContent: {
        type: 'boolean',
        description: 'Include text content of elements',
        default: true
      },
      includeForms: {
        type: 'boolean',
        description: 'Include form analysis',
        default: true
      },
      includeLinks: {
        type: 'boolean',
        description: 'Include link analysis',
        default: true
      },
      maxDepth: {
        type: 'number',
        description: 'Maximum depth for element analysis',
        minimum: 1,
        maximum: 5,
        default: 2
      }
    }
  }
};

export async function handleAnalyzePage(
  args: unknown,
  browserManager: BrowserManager
): Promise<string> {
  const { includeContent, includeForms, includeLinks, maxDepth } = AnalyzePageArgsSchema.parse(args);
  
  try {
    const page = await browserManager.getCurrentPage();
    const title = await browserManager.getPageTitle();
    const url = await browserManager.getPageUrl();
    
    const structure: PageStructure = {
      title,
      url,
      elements: [],
      forms: [],
      links: []
    };

    // Get interactive and structural elements
    const elements = await page.evaluate((options) => {
      const { includeContent, maxDepth } = options;
      const result: PageElement[] = [];
      
      // Target important interactive and structural elements
      const selectors = [
        'button', 'input', 'select', 'textarea', 'a[href]',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'nav', 'main', 'section', 'article', 'aside',
        '[role="button"]', '[role="link"]', '[role="tab"]', '[role="menuitem"]',
        '.btn', '.button', '.link', '.menu-item', '.tab'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        Array.from(elements).slice(0, 20).forEach(el => {
          const element = el as HTMLElement;
          const computedStyle = window.getComputedStyle(element);
          
          // Skip hidden elements
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return;
          }
          
          const attributes: Record<string, string> = {};
          Array.from(element.attributes).forEach(attr => {
            attributes[attr.name] = attr.value;
          });
          
          result.push({
            tag: element.tagName.toLowerCase(),
            text: includeContent ? (element.textContent || '').trim().slice(0, 200) : undefined,
            attributes,
            role: element.getAttribute('role') || undefined,
            accessible_name: element.getAttribute('aria-label') || 
                           element.getAttribute('aria-labelledby') || 
                           element.getAttribute('title') || undefined
          });
        });
      });
      
      return result;
    }, { includeContent, maxDepth });
    
    structure.elements = elements;

    // Analyze forms if requested
    if (includeForms) {
      const forms = await page.evaluate(() => {
        return Array.from(document.forms).map(form => ({
          action: form.action || undefined,
          method: form.method || 'get',
          fields: Array.from(form.elements).map(element => {
            const el = element as HTMLInputElement;
            return {
              name: el.name || '',
              type: el.type || 'text',
              label: el.labels?.[0]?.textContent?.trim() || 
                    document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || 
                    el.placeholder || undefined,
              required: el.required
            };
          }).filter(field => field.name)
        }));
      });
      structure.forms = forms;
    }

    // Analyze links if requested
    if (includeLinks) {
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .slice(0, 50)
          .map(link => ({
            text: (link.textContent || '').trim().slice(0, 100),
            href: (link as HTMLAnchorElement).href,
            target: link.getAttribute('target') || undefined
          }))
          .filter(link => link.text && link.href);
      });
      structure.links = links;
    }

    return JSON.stringify({
      success: true,
      analysis: structure,
      summary: {
        totalElements: structure.elements.length,
        totalForms: structure.forms.length,
        totalLinks: structure.links.length,
        pageTitle: title
      }
    }, null, 2);
    
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Page analysis failed'
    }, null, 2);
  }
}