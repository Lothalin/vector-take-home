import * as cheerio from 'cheerio';
import { CoveoConfig, CoveoResponse } from '../types/CoveoTypes.js';

export class CoveoApiClient {
  private static readonly COVEO_ENDPOINT = 'https://medtronicincproductionjlsldzfy.orghipaa.coveo.com/rest/search/v2';
  private static readonly DEFAULT_RESULTS_LIMIT = 200;
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  extractCoveoConfig($: ReturnType<typeof cheerio.load>): CoveoConfig {
    const config: CoveoConfig = {};
    
    try {
      const bodyText = $('body').text();
      const accessTokenMatch = bodyText.match(/accessToken['":\s]*['"]([^'"]+)['"]/i);
      if (accessTokenMatch) {
        config.accesstoken = accessTokenMatch[1];
      }      
    } catch (error) {
      console.error(`Error extracting Coveo config: ${error}`);
    }
    
    return config;
  }

  async fetchProductData(coveoConfig: CoveoConfig): Promise<CoveoResponse | null> {
    try {
      const requestBody = {
        numberOfResults: CoveoApiClient.DEFAULT_RESULTS_LIMIT,
        aq: '@products_category="Cardiac rhythm and diagnostics"'
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': CoveoApiClient.USER_AGENT,
        'Accept': 'application/json',
        'Referer': 'https://www.medtronic.com/ca-en/healthcare-professionals/products/cardiac-rhythm.html',
        'Origin': 'https://www.medtronic.com'
      };

      if (coveoConfig.accesstoken) {
        (requestBody as any).accessToken = coveoConfig.accesstoken;
        headers['Authorization'] = `Bearer ${coveoConfig.accesstoken}`;
      }

      const response = await fetch(CoveoApiClient.COVEO_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Coveo API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as CoveoResponse;
      return data;
    } catch (error) {
      console.error(`Error fetching from Coveo API: ${error}`);
      return null;
    }
  }
}
