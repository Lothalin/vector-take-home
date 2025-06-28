import * as cheerio from 'cheerio';
import { CardiacDevice } from '../types/ParsedContent.js';

export interface IProductInformationGrabber {
  extractProductInfo($: ReturnType<typeof cheerio.load>, baseUrl: string): CardiacDevice[] | Promise<CardiacDevice[]>;

  canHandle($: ReturnType<typeof cheerio.load>): boolean;
}
