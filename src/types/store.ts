export interface Store {
  settings: any;
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  currency: string;
  timezone: string;
  role: string;
  logo?: string;
  createdAt: string;
}

export interface StoreFormData {
  name: string;
  email: string;
  address: string;
  phone: string;
  currency: string;
  timezone: string;
  logo?: string;
}

export interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  loading: boolean;
  error: string | null;
}

export const TIMEZONES = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "EST - Eastern Standard Time" },
  { value: "America/Chicago", label: "CST - Central Standard Time" },
  { value: "America/Denver", label: "MST - Mountain Standard Time" },
  { value: "America/Los_Angeles", label: "PST - Pacific Standard Time" },
  { value: "Europe/London", label: "GMT - Greenwich Mean Time" },
  { value: "Europe/Paris", label: "CET - Central European Time" },
  { value: "Asia/Tokyo", label: "JST - Japan Standard Time" },
  { value: "Asia/Shanghai", label: "CST - China Standard Time" },
  { value: "Asia/Kolkata", label: "IST - India Standard Time" },
  {
    value: "Australia/Sydney",
    label: "AEST - Australian Eastern Standard Time",
  },
];

export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CNY", label: "CNY - Chinese Yuan", symbol: "¥" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "CHF", label: "CHF - Swiss Franc", symbol: "CHF" },
  { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr" },
];
