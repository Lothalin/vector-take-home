import * as cheerio from 'cheerio';

/**
 * Structured representation of parsed HTML content
 */
export interface ParsedContent {
  content: string;
}

/**
 * HTML content parser using Cheerio for DOM manipulation
 * Extracts structured data from HTML content
 */
export class HtmlParser {
  
  /**
   * Parse HTML content into structured data
   * @param html The HTML content to parse
   * @param baseUrl The base URL for resolving relative links
   * @returns Structured parsed content
   */
  parse(html: string): ParsedContent {
    const $ = cheerio.load(html);
    const content = this.extractContent($);
    
    return {
      content
    };
  }

  /**
   * Extract main content from the page
   * @private
   */
  private extractContent($: ReturnType<typeof cheerio.load>): string {
    $('script, style, nav, header, footer, aside').remove();
    const mainContent = $('main, article, [role="main"], .content, .main-content').first();
    if (mainContent.length > 0) {
      return mainContent.text().trim();
    }
    return $('body').text().trim();
  }
}
