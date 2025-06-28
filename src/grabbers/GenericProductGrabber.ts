import * as cheerio from 'cheerio';
import { IProductInformationGrabber } from '../interfaces/IProductInformationGrabber.js';
import { CardiacDevice } from '../types/ParsedContent.js';

export class GenericProductGrabber implements IProductInformationGrabber {
  
  canHandle($: ReturnType<typeof cheerio.load>): boolean {
    return true;
  }

  async extractProductInfo($: ReturnType<typeof cheerio.load>, baseUrl: string): Promise<CardiacDevice[]> {
    try {
      const devices: CardiacDevice[] = [];

    $('product').each((_, element) => {
      const $product = $(element);
      const title = $product.find('name').text().trim();
      const description = $product.find('description').text().trim();
      const models = $product.find('models').text().trim();
      const modelList = models ? models.split(',').map(model => model.trim()) : [];
      let type = $product.find('type').text().trim();

      if (!description) {
        return;
      }

      if (!title) {
        return;
      }

      if (!type) {
        return;
      }

      switch (type) {
        case 'Pacemaker':
          type = 'Pacer';
          break;
        case 'ICM':
          type = 'Loop';
          break;
        default:
          break;
      }

      devices.push({
        name: title,
        description: description.trim(),
        type: type,
        models: modelList,
        url: baseUrl
      });
    });

    return devices;
  } catch (error) {
    console.error(`Generic extraction failed: ${error}`);
    return [];
  }
  }
}