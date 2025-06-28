import * as cheerio from 'cheerio';
import { IProductInformationGrabber } from '../interfaces/IProductInformationGrabber.js';
import { CardiacDevice } from '../types/ParsedContent.js';
import { CoveoApiClient } from '../services/CoveoApiClient.js';
import { CoveoResponse } from '../types/CoveoTypes.js';

export class MedtronicProductGrabber implements IProductInformationGrabber {
  private static readonly DEVICE_TYPE_TERMS_TO_REMOVE = ['ICD', 'CRT-D', 'CRT-P'];

  canHandle($: ReturnType<typeof cheerio.load>): boolean {
    const titleText = $('title').text().toLowerCase();
    
    return titleText.includes('medtronic');
  }

  async extractProductInfo($: ReturnType<typeof cheerio.load>, baseUrl: string): Promise<CardiacDevice[]> {
    try {
      const coveoApiClient = new CoveoApiClient();
      const coveoConfig = coveoApiClient.extractCoveoConfig($);
      
      if (!coveoConfig.accesstoken) {
        console.warn('No Coveo access token found in page');
        return [];
      }
      
      const response = await coveoApiClient.fetchProductData(coveoConfig);
      if (!response) {
        console.warn('No data received from Coveo API');
        return [];
      }
      
      const devices = this.parseResponse(response);
      return devices;
    } catch (error) {
      console.error(`Coveo API extraction failed: ${error}`);
      return [];
    }
  }

  private parseResponse(data: CoveoResponse): CardiacDevice[] {
    const productFamilies = new Map<string, CardiacDevice>();
    
    try {
      const results = data.results || [];
      
      for (const result of results) {
        if (result.raw?.pagetype && result.raw.pagetype.includes('product-model')) {
          continue;
        }

        let familyName = result.raw?.products_model_en || result.title || 'Unknown Product';
        const modelNumber = result.title;
        const deviceType = this.mapDeviceType(result.raw?.products_type || []);

        familyName = this.cleanFamilyName(familyName);
        const description = (result.raw?.description) || result.excerpt || '';

        if (!productFamilies.has(familyName)) {
          productFamilies.set(familyName, {
            name: familyName,
            description: description,
            url: result.uri || '',
            type: deviceType,
            models: []
          });
        }

        const family = productFamilies.get(familyName)!;
        if (modelNumber && modelNumber !== familyName && !family.models.includes(modelNumber)) {
          family.models.push(modelNumber);
        }
      }

      const devices = Array.from(productFamilies.values());
      return devices;
    } catch (error) {
      console.error(`Error parsing Coveo response:`, error);
    }
    
    return [];
  }

  private mapDeviceType(types: string[]): string {
    const allTypes = types.join(' ').toLowerCase();

    if (allTypes.includes('crt-d') ||
        allTypes.includes('icd') || 
        allTypes.includes('implantable cardioverter defibrillator') ||
        allTypes.includes('defibrillator')) {
      return 'ICD';
    }
    
    if (allTypes.includes('crt-p') || 
        allTypes.includes('crt-ps') ||
        allTypes.includes('pacemaker') ||
        allTypes.includes('pacer')) {
      return 'Pacer';
    }
    
    if (allTypes.includes('icm') || 
        allTypes.includes('implantable cardiac monitor') ||
        allTypes.includes('insertable cardiac monitor')) {
      return 'Loop';
    }

    // Right here when I started seeing a lot of unknown device
    // type returns I started to wonder if I should have gone a 
    // different route and maybe queried every individual page
    // for more detailed information instead of relying on Coveo
    // but I didnt really find anything in the individual pages
    // that was significantly different from what Coveo provided.
    return 'Unknown Device Type';
  }

  private cleanFamilyName(familyName: string): string {
    return MedtronicProductGrabber.DEVICE_TYPE_TERMS_TO_REMOVE
      .reduce((name, term) => name.replaceAll(term, ''), familyName)
      .replaceAll('-', ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
