export interface CardiacDevice {
  name: string;
  url: string;
  description: string;
  type: string;
  models: string[];
}

export interface ParsedContent {
  devices: CardiacDevice[];
}
