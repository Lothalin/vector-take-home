import { describe, it, expect, beforeEach } from 'vitest';
import { MedtronicProductGrabber } from '../src/grabbers/MedtronicProductGrabber.js';
import * as cheerio from 'cheerio';

describe('MedtronicProductGrabber', () => {
  let grabber: MedtronicProductGrabber;

  beforeEach(() => {
    grabber = new MedtronicProductGrabber();
  });

  describe('canHandle', () => {
    it('should handle Medtronic pages', () => {
      const html = '<html><head><title>Medtronic Product Page</title></head></html>';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(true);
    });

    it('should handle Medtronic pages case-insensitive', () => {
      const html = '<html><head><title>MEDTRONIC Product Page</title></head></html>';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(true);
    });

    it('should not handle non-Medtronic pages', () => {
      const html = '<html><head><title>Some Other Company</title></head></html>';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(false);
    });

    it('should handle pages with Medtronic in the middle of title', () => {
      const html = '<html><head><title>Advanced Medtronic Technologies</title></head></html>';
      const $ = cheerio.load(html);
      
      expect(grabber.canHandle($)).toBe(true);
    });
  });

  describe('extractProductInfo', () => {
    it('should return empty array when no Coveo token found', async () => {
      const html = '<html><head><title>Medtronic</title></head></html>';
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'https://medtronic.com');
      expect(result).toEqual([]);
    });

    it('should handle extraction errors gracefully', async () => {
      const html = '<html><head><title>Medtronic</title></head></html>';
      const $ = cheerio.load(html);
      
      const result = await grabber.extractProductInfo($, 'invalid-url');
      expect(result).toEqual([]);
    });
  });

  describe('mapDeviceType', () => {
    it('should map ICD types correctly', () => {
      expect(grabber['mapDeviceType'](['icd'])).toBe('ICD');
      expect(grabber['mapDeviceType'](['defibrillator'])).toBe('ICD');
      expect(grabber['mapDeviceType'](['crt-d'])).toBe('ICD');
    });

    it('should map Pacer types correctly', () => {
      expect(grabber['mapDeviceType'](['pacemaker'])).toBe('Pacer');
      expect(grabber['mapDeviceType'](['pacer'])).toBe('Pacer');
      expect(grabber['mapDeviceType'](['crt-p'])).toBe('Pacer');
    });

    it('should map Loop types correctly', () => {
      expect(grabber['mapDeviceType'](['icm'])).toBe('Loop');
      expect(grabber['mapDeviceType'](['implantable cardiac monitor'])).toBe('Loop');
    });

    it('should return Unknown for unrecognized types', () => {
      expect(grabber['mapDeviceType'](['unknown'])).toBe('Unknown Device Type');
    });
  });

  describe('cleanFamilyName', () => {
    it('should remove device type terms', () => {
      expect(grabber['cleanFamilyName']('Test ICD Device')).toBe('Test Device');
      expect(grabber['cleanFamilyName']('CRT-D Test')).toBe('Test');
    });

    it('should replace hyphens with spaces', () => {
      expect(grabber['cleanFamilyName']('Test-Device')).toBe('Test Device');
    });

    it('should normalize spaces', () => {
      expect(grabber['cleanFamilyName']('Test   Device')).toBe('Test Device');
    });
  });
});