declare module "country-telephone-data" {
  interface Country {
    name: string;
    iso2: string;
    dialCode: string;
    priority: number;
    areaCodes: string[] | null;
    format?: string;
  }

  export const allCountries: Country[];
  export const iso2Lookup: Record<string, number>;
  export const allCountryCodes: string[];
}
