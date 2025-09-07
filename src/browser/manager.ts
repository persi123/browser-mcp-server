import { Browser, BrowserContext, Page, chromium } from 'playwright';
import * as os from 'os';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      try {
        // Check system requirements before launching
        this.checkSystemRequirements();
        
        const launchOptions = this.getBrowserLaunchOptions();
        console.error('Launching browser with Playwright...');
        this.browser = await chromium.launch(launchOptions);
        console.error('Browser launched successfully');
      } catch (error) {
        console.error('Browser launch failed:', error);
        
        // Provide helpful error messages for common issues
        if (error instanceof Error) {
          if (error.message.includes('Permission denied')) {
            throw new Error(`Browser launch failed: Permission denied. On macOS, you may need to grant Terminal/VS Code accessibility permissions in System Preferences > Security & Privacy > Privacy > Accessibility.`);
          } else if (error.message.includes('DISPLAY')) {
            throw new Error(`Browser launch failed: No display available. Set BROWSER_HEADLESS=true for headless mode or ensure display is available.`);
          }
        }
        
        throw new Error(`Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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

  private getBrowserLaunchOptions() {
    const platform = os.platform();
    const isHeadless = process.env.BROWSER_HEADLESS !== 'false';
    
    // Base arguments for all platforms
    const baseArgs = [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ];

    // macOS specific arguments
    if (platform === 'darwin') {
      baseArgs.push(
        '--disable-gpu-sandbox',
        '--disable-software-rasterizer',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps'
      );
      
      // Add display environment check for macOS
      if (!isHeadless && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
        console.warn('Warning: No display environment detected on macOS. Browser may not be visible.');
      }
    }

    // Linux specific arguments
    if (platform === 'linux') {
      baseArgs.push(
        '--disable-gpu',
        '--disable-software-rasterizer'
      );
      
      if (!process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
        console.warn('Warning: No DISPLAY or WAYLAND_DISPLAY environment variable set. Running headless.');
      }
    }

    const launchOptions: any = {
      headless: isHeadless,
      args: baseArgs
    };

    // Add execution path for better reliability on macOS
    if (platform === 'darwin' && !isHeadless) {
      launchOptions.executablePath = undefined; // Let Playwright find the browser
      launchOptions.channel = 'chrome'; // Prefer Chrome channel on macOS
    }

    console.error(`Browser launch options: headless=${isHeadless}, platform=${platform}, args=${baseArgs.length} args`);
    
    return launchOptions;
  }

  // Add method to check system requirements
  private checkSystemRequirements(): void {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      // Check if we're running in a proper macOS environment
      if (!process.env.HOME) {
        throw new Error('Invalid macOS environment: HOME variable not set');
      }
    }
  }
}