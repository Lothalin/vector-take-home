import { describe, it, expect, beforeEach } from 'vitest';
import { GenericProductGrabber } from '../src/grabbers/GenericProductGrabber.js';
import * as cheerio from 'cheerio';

describe('GenericProductGrabber', () => {
  let grabber: GenericProductGrabber;

  beforeEach(() => {
    grabber = new GenericProductGrabber();
  });

  describe('canHandle', () => {
    it('should handle any page', () => {
      const html = '<html><head><title>Any Page</title></head></html>';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(true);
    });

    it('should handle empty pages', () => {
      const html = '';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(true);
    });
  });

  describe('extractProductInfo', () => {
    it('should extract single product from XML structure', async () => {
      const html = `
        <html>
          <product>
            <name>Test Device</name>
            <description>Test Description</description>
            <type>Pacemaker</type>
            <models>A123</models>
          </product>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Device');
      expect(result[0].description).toBe('Test Description');
      expect(result[0].type).toBe('Pacer');
      expect(result[0].models).toEqual(['A123']);
    });

    it('should extract multiple products', async () => {
      const html = `
        <html>
          <product>
            <name>Device 1</name>
            <description>Description 1</description>
            <type>Pacemaker</type>
            <models>A123</models>
          </product>
          <product>
            <name>Device 2</name>
            <description>Description 2</description>
            <type>ICM</type>
            <models>B456</models>
          </product>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Device 1');
      expect(result[1].name).toBe('Device 2');
    });

    it('should handle multiple models', async () => {
      const html = `
        <html>
          <product>
            <name>Test Device</name>
            <description>Test Description</description>
            <type>Pacemaker</type>
            <models>A123, B456, C789</models>
          </product>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result[0].models).toEqual(['A123', 'B456', 'C789']);
    });

    it('should skip products with missing required fields', async () => {
      const html = `
        <html>
          <product>
            <name>Complete Device</name>
            <description>Complete Description</description>
            <type>Pacemaker</type>
          </product>
          <product>
            <name></name>
            <description>Missing title</description>
            <type>Pacemaker</type>
          </product>
          <product>
            <name>Missing description</name>
            <description></description>
            <type>Pacemaker</type>
          </product>
        </html>
      `;
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Complete Device');
    });

    it('should handle empty product list', async () => {
      const html = '<html><head><name>No Products</name></head></html>';
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result).toEqual([]);
    });

    it('should handle extraction errors gracefully', async () => {
      const html = '<html><body><p>Invalid structure</p></body></html>';
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'http://test.com');
      expect(result).toEqual([]);
    });
  });
});