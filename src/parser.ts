import * as cheerio from 'cheerio';
import { IProductInformationGrabber } from './interfaces/index.js';
import { ParsedContent } from './types/index.js';
import { GenericProductGrabber, MedtronicProductGrabber } from './grabbers/index.js';

export class HtmlParser {
  private availableGrabbers: IProductInformationGrabber[];

  constructor(customGrabbers?: IProductInformationGrabber[]) {
    this.availableGrabbers = customGrabbers || [
      new MedtronicProductGrabber(),
      new GenericProductGrabber()
    ];
  }

  async parse(html: string, baseUrl: string = ''): Promise<ParsedContent> {
    const $ = cheerio.load(html);
    const productGrabber = this.selectBestGrabber($);
    const devices = await productGrabber.extractProductInfo($, baseUrl);
    
    return {
      devices
    };
  }

  private selectBestGrabber($: ReturnType<typeof cheerio.load>): IProductInformationGrabber {
    for (const grabber of this.availableGrabbers) {
      if (grabber.canHandle($)) {
        return grabber;
      }
    }
    
    return new GenericProductGrabber();
  }
}
