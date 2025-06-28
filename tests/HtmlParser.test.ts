import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HtmlParser } from '../src/parser.js';
import { MedtronicProductGrabber } from '../src/grabbers/MedtronicProductGrabber.js';
import { GenericProductGrabber } from '../src/grabbers/GenericProductGrabber.js';
import * as cheerio from 'cheerio';  // Add this line

describe('HtmlParser', () => {
  let parser: HtmlParser;

  beforeEach(() => {
    parser = new HtmlParser();
  });

  describe('parse', () => {
    it('should use MedtronicProductGrabber for Medtronic pages', async () => {
      const html = `
        <html>
          <head>
            <title>Medtronic Product Page</title>
          </head>
          <body>
            <h1>Welcome to Medtronic</h1>
          </body>
        </html>
      `;
      const url = 'https://medtronic.com/product';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
    });

    it('should use GenericProductGrabber for non-Medtronic pages', async () => {
      const html = `
        <html>
          <head>
            <title>Other Company Product</title>
          </head>
          <body>
            <product>
              <name>Test Device</name>
              <description>Test Description</description>
              <type>Pacemaker</type>
              <models>A123</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://othercompany.com/product';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(result.devices).toHaveLength(1);
      expect(result.devices[0].name).toBe('Test Device');
      expect(result.devices[0].type).toBe('Pacer'); // GenericProductGrabber maps Pacemaker to Pacer
    });

    it('should handle empty HTML gracefully', async () => {
      const html = '';
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
    });

    it('should handle malformed HTML', async () => {
      const html = '<html><head><title>Broken HTML</head><body><p>Missing closing tags';
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
    });

    it('should handle HTML with no title', async () => {
      const html = `
        <html>
          <head></head>
          <body>
            <product>
              <name>Device Without Page Title</name>
              <description>Test Description</description>
              <type>ICD</type>
              <models>X999</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
    });

    it('should pass correct URL to grabbers', async () => {
      const html = `
        <html>
          <head><title>Test Page</title></head>
          <body>
            <product>
              <name>URL Test Device</name>
              <description>Testing URL passing</description>
              <type>Loop</type>
              <models>URL123</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://testsite.com/specific-page';

      const result = await parser.parse(html, url);
      
      expect(result.devices[0].url).toBe(url);
    });

    it('should handle Medtronic pages with case variations', async () => {
      const html = `
        <html>
          <head>
            <title>MEDTRONIC Product Information</title>
          </head>
          <body>
            <h1>Device Information</h1>
          </body>
        </html>
      `;
      const url = 'https://medtronic.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
    });

    it('should handle multiple products in generic format', async () => {
      const html = `
        <html>
          <head><title>Multiple Products</title></head>
          <body>
            <product>
              <name>First Device</name>
              <description>First Description</description>
              <type>Pacemaker</type>
              <models>A111</models>
            </product>
            <product>
              <name>Second Device</name>
              <description>Second Description</description>
              <type>ICM</type>
              <models>B222, C333</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result.devices).toHaveLength(2);
      expect(result.devices[0].name).toBe('First Device');
      expect(result.devices[1].name).toBe('Second Device');
      expect(result.devices[1].models).toEqual(['B222', 'C333']);
    });

    it('should handle parsing errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const html = '<html><head><title>Error Test</title></head></html>';
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
      
      consoleSpy.mockRestore();
    });

    it('should return empty devices array when no products found', async () => {
      const html = '<html><head><title>No Products Page</title></head><body><p>No products here</p></body></html>';
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
      expect(result.devices).toHaveLength(0);
    });

    it('should handle URLs with different protocols', async () => {
      const html = `
        <html>
          <head><title>Protocol Test</title></head>
          <body>
            <product>
              <name>Protocol Device</name>
              <description>Testing different protocols</description>
              <type>Pacemaker</type>
              <models>PROTO123</models>
            </product>
          </body>
        </html>
      `;
      
      let result = await parser.parse(html, 'http://example.com');
      expect(result.devices).toHaveLength(1);
      expect(result.devices[0].url).toBe('http://example.com');
      
      result = await parser.parse(html, 'https://example.com');
      expect(result.devices).toHaveLength(1);
      expect(result.devices[0].url).toBe('https://example.com');
    });

    it('should preserve device type mappings from GenericProductGrabber', async () => {
      const html = `
        <html>
          <head><title>Type Mapping Test</title></head>
          <body>
            <product>
              <name>Type Test Device 1</name>
              <description>Pacemaker type mapping</description>
              <type>Pacemaker</type>
              <models>TYPE1</models>
            </product>
            <product>
              <name>Type Test Device 2</name>
              <description>ICM type mapping</description>
              <type>ICM</type>
              <models>TYPE2</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://example.com';

      const result = await parser.parse(html, url);
      
      expect(result.devices).toHaveLength(2);
      expect(result.devices[0].type).toBe('Pacer'); // Pacemaker maps to Pacer
      expect(result.devices[1].type).toBe('Loop');  // ICM maps to Loop
    });
  });

  describe('grabber selection', () => {
    it('should prioritize MedtronicProductGrabber for Medtronic pages', async () => {
      const medtronicHtml = '<html><head><title>Medtronic Advanced Therapy</title></head></html>';
      const url = 'https://medtronic.com';

      const result = await parser.parse(medtronicHtml, url);
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(Array.isArray(result.devices)).toBe(true);
    });

    it('should use GenericProductGrabber when MedtronicProductGrabber cannot handle', async () => {
      const nonMedtronicHtml = `
        <html>
          <head><title>Boston Scientific Products</title></head>
          <body>
            <product>
              <name>Non-Medtronic Device</name>
              <description>Test Description</description>
              <type>ICD</type>
              <models>BS123</models>
            </product>
          </body>
        </html>
      `;
      const url = 'https://bostonscientific.com';

      // Add debugging
      const $ = cheerio.load(nonMedtronicHtml);
      const titleText = $('title').text();
      const includesMedtronic = titleText.toLowerCase().includes('medtronic');
      
      const result = await parser.parse(nonMedtronicHtml, url);
      
      // Throw error with debug info if it fails
      if (result.devices.length === 0) {
        throw new Error(`DEBUG INFO:
          Title text: ${titleText}
          Includes medtronic: ${includesMedtronic}
          Result devices count: ${result.devices.length}
          Result: ${JSON.stringify(result, null, 2)}
        `);
      }
      
      expect(result).toBeDefined();
      expect(result.devices).toBeDefined();
      expect(result.devices).toHaveLength(1);
      expect(result.devices[0].name).toBe('Non-Medtronic Device');
    });
  });
});