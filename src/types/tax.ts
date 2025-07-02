export interface TaxType {
  id: string;
  name: string;
  description?: string;
}

export interface TaxCode {
  id: string;
  code: string;
  description?: string;
}

export interface TaxRegion {
  id: string;
  name: string;
  code: string;
}

export interface TaxRate {
  id: string;
  rate: number;
  typeId: string;
  regionId: string;
}