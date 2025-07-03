export interface TaxItem {
  id: string;
  name: string;
  description?: string;
  payer: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxTypeResponse {
  success: boolean;
  message: string;
  data: TaxItem[];
  status: number;
  timestamp: string;
}

export interface TaxCode {
  success:boolean;
  message:string;
   data: TaxCodeItem[];
  id: string;
  status: number;
  timestamp: string;
}

interface TaxCodeItem {
  id: string;
  code: string;
  description?: string;
  taxTypeId?:string;
  createdAt:string;
  updatedAt:string;

}

export interface TaxRegion {
  success:boolean;
  message:string;
  id: string;
  name: string;
  code: string;
}

export interface TaxRegionItem {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRegionResponse {
  success: boolean;
  message: string;
  data: TaxRegionItem[];
  status: number;
  timestamp: string;
}


export interface TaxRate {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: TaxRateData[]; // already used
}

export interface TaxRateData {
  id: string;
  rate: number;
  rateType: 'PERCENTAGE' | 'FIXED'; // stricter typing
  effectiveFrom: string;
  effectiveTo: string;
  regionId: string;
  taxTypeId: string;
  taxCodeId: string;
  createdAt: string;
  updatedAt: string;
  region?: {
    name?: string;
  };
  taxType?: {
    name?: string;
    description?: string;
  };
  taxCode?: {
    code?: string;
  }

}
