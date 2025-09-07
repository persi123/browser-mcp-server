import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
    }
    
    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    }
    
    if (!this.page) {
      this.page = await this.context.newPage();
    }
  }

  async navigateToUrl(url: string): Promise<void> {
    await this.ensureInitialized();
    await this.page!.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for dynamic content to load
    await this.page!.waitForTimeout(1000);
  }

  async getCurrentPage(): Promise<Page> {
    await this.ensureInitialized();
    return this.page!;
  }

  async getPageTitle(): Promise<string> {
    await this.ensureInitialized();
    return await this.page!.title();
  }

  async getPageUrl(): Promise<string> {
    await this.ensureInitialized();
    return this.page!.url();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.page) {
      await this.initialize();
    }
  }
}