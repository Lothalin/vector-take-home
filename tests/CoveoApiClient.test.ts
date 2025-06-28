import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoveoApiClient } from '../src/services/CoveoApiClient.js';
import * as cheerio from 'cheerio';

// Mock fetch globally
global.fetch = vi.fn();

describe('CoveoApiClient', () => {
  let client: CoveoApiClient;

  beforeEach(() => {
    client = new CoveoApiClient();
    vi.clearAllMocks();
  });

  describe('extractCoveoConfig', () => {
    it('should extract access token from script tag', () => {
      const html = `
        <html>
          <body>
            <script>
              window.coveoConfig = {
                accesstoken: 'test-token-123',
                organizationId: 'test-org'
              };
            </script>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const config = client.extractCoveoConfig($);
      expect(config.accesstoken).toBe('test-token-123');
    });

    it('should handle pages with no access token', () => {
      const html = `
        <html>
          <body>
            <script>
              var someOtherVar = 'not a token';
            </script>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const config = client.extractCoveoConfig($);
      expect(config.accesstoken).toBeUndefined();
    });

    it('should extract token from body text', () => {
      const html = `
        <html>
          <body>
            <script>
              accesstoken: 'body-token-456'
            </script>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const config = client.extractCoveoConfig($);
      expect(config.accesstoken).toBe('body-token-456');
    });
  });

  describe('fetchProductData', () => {
    it('should make API request with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              title: 'Test Device',
              uri: 'https://test.com/device',
              raw: {
                products_model_en: 'Test Model',
                products_type: ['Pacemaker'],
                description: 'Test description'
              }
            }
          ]
        })
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const config = { accesstoken: 'test-token' };
      const result = await client.fetchProductData(config);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://medtronicincproductionjlsldzfy.orghipaa.coveo.com/rest/search/v2',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      
      expect(result).toBeDefined();
      expect(result?.results).toHaveLength(1);
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const config = { accesstoken: 'invalid-token' };
      const result = await client.fetchProductData(config);
      
      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const config = { accesstoken: 'test-token' };
      const result = await client.fetchProductData(config);
      
      expect(result).toBeNull();
    });

    it('should include correct request body format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ results: [] })
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const config = { accesstoken: 'test-token' };
      await client.fetchProductData(config);
      
      const call = (fetch as any).mock.calls[0];
      const requestBody = JSON.parse(call[1].body);
      
      // Check that the request body has the expected structure based on actual implementation
      expect(requestBody).toHaveProperty('numberOfResults', 200);
      expect(requestBody).toHaveProperty('aq');
      expect(requestBody.aq).toContain('products_category');
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({})
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const config = { accesstoken: 'test-token' };
      const result = await client.fetchProductData(config);
      
      expect(result).toBeDefined();
    });
  });

  describe('integration', () => {
    it('should work with valid token extraction', async () => {
      const html = `
        <html>
          <body>
            <script>
              accesstoken: 'integration-token'
            </script>
          </body>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              title: 'Integration Test Device',
              uri: 'https://test.com/device',
              raw: {
                products_model_en: 'Integration Model',
                products_type: ['ICD'],
                description: 'Integration test description'
              }
            }
          ]
        })
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const config = client.extractCoveoConfig($);
      if (config.accesstoken) {
        const result = await client.fetchProductData(config);
        expect(result?.results).toHaveLength(1);
        expect(result?.results[0].title).toBe('Integration Test Device');
      }
    });
  });
});