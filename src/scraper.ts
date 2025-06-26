import fetch from 'node-fetch';

/**
 * Configuration options for the WebScraper
 */
export interface ScraperConfig {
  /** Request timeout in milliseconds (default: 3000) */
  timeout?: number;
  /** Number of retry attempts (default: 3) */
  retryAttempts?: number;
}

/** User agent string to mimic a real browser */
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * A robust web scraper for fetching HTML content from websites
 * Features retry logic, timeout handling, and realistic browser headers
 */
export class WebScraper {
  private config: Required<ScraperConfig>;

  /**
   * Create a new WebScraper instance
   * @param config Configuration options for timeout and retry behavior
   */
  constructor(config: ScraperConfig = {}) {
    this.config = {
      timeout: config.timeout ?? 3000,
      retryAttempts: config.retryAttempts ?? 3
    };
  }

  /**
   * Fetch and return the HTML content of a webpage
   * @param url The URL to scrape (required)
   * @returns Promise that resolves to the HTML content as a string
   * @throws Error if the request fails after all retry attempts
   */
  async fetchPage(url: string): Promise<string> {
    console.log(`Fetching page: ${url}`);
    
    try {
      const html = await this.fetchWithRetry(url);
      console.log(`Successfully fetched ${html.length} characters`);
      return html;
    } catch (error) {
      console.error('Failed to fetch page:', error);
      throw new Error(`Failed to fetch page: ${error}`);
    }
  }

  /**
   * Fetch a URL with retry logic and timeout handling
   * @param url The URL to fetch
   * @param attempt Current attempt number (used for recursive retries)
   * @returns Promise that resolves to the response text
   * @private
   */
  private async fetchWithRetry(url: string, attempt = 1): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.log(`Attempt ${attempt} failed, retrying in ${attempt * 1000}ms...`);
        await this.delay(attempt * 1000);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Utility method to create a delay/sleep
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the specified delay
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
