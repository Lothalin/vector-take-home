export interface CoveoConfig {
  accesstoken?: string;
  searchhub?: string;
  organizationid?: string;
}

export interface CoveoResult {
  title: string;
  uri: string;
  excerpt?: string;
  raw?: {
    products_model_en?: string;
    products_type?: string[];
    description?: string;
    pagetype?: string[];
  };
}

export interface CoveoResponse {
  results: CoveoResult[];
}
