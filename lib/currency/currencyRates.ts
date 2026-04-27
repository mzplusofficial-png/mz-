/**
 * Fallback currency rates relative to XAF (CFA Franc).
 * 1 unit of currency = X XAF.
 */
export const FALLBACK_RATES: Record<string, number> = {
  XAF: 1,
  XOF: 1,       // West African CFA (1:1 with XAF)
  EUR: 655.957, // Fixed rate for CFA Franc
  USD: 610.50,  // Approximate current rate
  CDF: 4.59,    // Congolese Franc (DRC)
  MWK: 2.78,    // Malawian Kwacha
  RWF: 2.10,    // Rwandan Franc
  TZS: 4.18,    // Tanzanian Shilling
  UGX: 6.23,    // Ugandan Shilling
  ZMW: 0.041,   // Zambian Kwacha
  BIF: 0.21,    // Burundi Franc
  KMF: 1.33,    // Comorian Franc
  DJF: 3.43,    // Djiboutian Franc
  GNF: 0.071,   // Guinean Franc
  MGA: 0.13,    // Malagasy Ariary
  MUR: 13.20,   // Mauritian Rupee
  MAD: 60.50,   // Moroccan Dirham
  SCR: 45.00,   // Seychellois Rupee
  TND: 195.00,  // Tunisian Dinar
  DZD: 4.50,    // Algerian Dinar
  AOA: 0.70,    // Angolan Kwanza
  BWP: 45.00,   // Botswana Pula
  CVE: 6.00,    // Cabo Verde Escudo
  EGP: 12.50,   // Egyptian Pound
  ETB: 5.40,    // Ethiopian Birr
  GMD: 9.00,    // Gambian Dalasi
  GHS: 45.00,   // Ghanaian Cedi
  KES: 4.70,    // Kenyan Shilling
  LRD: 3.20,    // Liberian Dollar
  LYD: 125.00,  // Libyan Dinar
  MRU: 15.50,   // Mauritanian Ouguiya
  MZN: 9.50,    // Mozambican Metical
  NAD: 32.00,   // Namibian Dollar
  NGN: 0.40,    // Nigerian Naira
  STN: 26.00,   // São Tomé and Príncipe Dobra
  SLE: 0.027,   // Sierra Leonean Leone
  SOS: 1.07,    // Somali Shilling
  ZAR: 32.00,   // South African Rand
  SSP: 0.47,    // South Sudanese Pound
  SDG: 1.00,    // Sudanese Pound
  ZWL: 1.90,    // Zimbabwean Dollar
};

export const SUPPORTED_CURRENCIES = [
  { code: 'XAF', symbol: 'FCFA', label: 'Franc CFA (CEMAC)' },
  { code: 'XOF', symbol: 'FCFA', label: 'Franc CFA (UEMOA)' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'CDF', symbol: 'FC', label: 'Franc Congolais' },
  { code: 'MWK', symbol: 'MK', label: 'Malawian Kwacha' },
  { code: 'RWF', symbol: 'RF', label: 'Rwandan Franc' },
  { code: 'TZS', symbol: 'TSh', label: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', label: 'Ugandan Shilling' },
  { code: 'ZMW', symbol: 'ZK', label: 'Zambian Kwacha' },
  { code: 'BIF', symbol: 'FBu', label: 'Franc Burundais' },
  { code: 'KMF', symbol: 'CF', label: 'Franc Comorien' },
  { code: 'DJF', symbol: 'Fdj', label: 'Franc Djibouti' },
  { code: 'GNF', symbol: 'FG', label: 'Franc Guinéen' },
  { code: 'MGA', symbol: 'Ar', label: 'Ariary Malgache' },
  { code: 'MUR', symbol: 'Rs', label: 'Roupie Mauricienne' },
  { code: 'MAD', symbol: 'DH', label: 'Dirham Marocain' },
  { code: 'SCR', symbol: 'SR', label: 'Roupie des Seychelles' },
  { code: 'TND', symbol: 'DT', label: 'Dinar Tunisien' },
  { code: 'DZD', symbol: 'DA', label: 'Dinar Algérien' },
  { code: 'AOA', symbol: 'Kz', label: 'Kwanza Angolais' },
  { code: 'BWP', symbol: 'P', label: 'Pula du Botswana' },
  { code: 'CVE', symbol: 'Esc', label: 'Escudo du Cap-Vert' },
  { code: 'EGP', symbol: 'E£', label: 'Livre Égyptienne' },
  { code: 'ETB', symbol: 'Br', label: 'Birr Éthiopien' },
  { code: 'GMD', symbol: 'D', label: 'Dalasi Gambien' },
  { code: 'GHS', symbol: 'GH₵', label: 'Cedi Ghanéen' },
  { code: 'KES', symbol: 'KSh', label: 'Shilling Kenyan' },
  { code: 'LRD', symbol: '$', label: 'Dollar Libérien' },
  { code: 'LYD', symbol: 'LD', label: 'Dinar Libyen' },
  { code: 'MRU', symbol: 'UM', label: 'Ouguiya Mauritanien' },
  { code: 'MZN', symbol: 'MT', label: 'Metical Mozambicain' },
  { code: 'NAD', symbol: '$', label: 'Dollar Namibien' },
  { code: 'NGN', symbol: '₦', label: 'Naira Nigérian' },
  { code: 'STN', symbol: 'Db', label: 'Dobra de São Tomé' },
  { code: 'SLE', symbol: 'Le', label: 'Leone de Sierra Leone' },
  { code: 'SOS', symbol: 'Sh', label: 'Shilling Somalien' },
  { code: 'ZAR', symbol: 'R', label: 'Rand Sud-Africain' },
  { code: 'SSP', symbol: '£', label: 'Livre Sud-Soudanaise' },
  { code: 'SDG', symbol: '£', label: 'Livre Soudanaise' },
  { code: 'ZWL', symbol: '$', label: 'Dollar du Zimbabwe' },
];
