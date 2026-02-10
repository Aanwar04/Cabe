// VIN Scanner Types

export interface ScannedBarcode {
  rawValue: string;
  format: string;
  timestamp: number;
}

export interface VINInfo {
  vin: string;
  make?: string;
  model?: string;
  year?: number;
  vehicleType?: string;
  plantCountry?: string;
  sequentialNumber?: string;
  checkDigit?: string;
  valid: boolean;
  errors?: string[];
}

// VIN Validation
export const validateVIN = (vin: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!vin) {
    return { valid: false, errors: ['VIN is required'] };
  }
  
  // VIN must be 17 characters
  if (vin.length !== 17) {
    errors.push('VIN must be exactly 17 characters');
  }
  
  // VIN must not contain I, O, Q
  const invalidChars = vin.match(/[IOQ]/g);
  if (invalidChars) {
    errors.push(`VIN cannot contain I, O, or Q`);
  }
  
  // Check digit validation (position 9)
  if (vin.length >= 9) {
    const checkDigit = vin.charAt(8);
    const calculatedCheck = calculateCheckDigit(vin);
    if (checkDigit.toUpperCase() !== calculatedCheck) {
      errors.push(`Invalid check digit. Expected: ${calculatedCheck}, Got: ${checkDigit}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Calculate VIN check digit
export const calculateCheckDigit = (vin: string): string => {
  if (vin.length < 9) return '?';
  
  const transliterationMap: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  };
  
  const weightMap: number[] = [
    8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2,
  ];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = vin.charAt(i).toUpperCase();
    const transliterated = transliterationMap[char];
    if (transliterated !== undefined) {
      sum += transliterated * weightMap[i];
    }
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 'X' : remainder.toString();
  
  return checkDigit;
};

// Get year from VIN code
export const getYearFromCode = (code: string): number => {
  const currentYear = new Date().getFullYear();
  const codeYearMap: { [key: string]: number } = {
    'A': 2010, 'L': 2020,
    'B': 2011, 'M': 2021,
    'C': 2012, 'N': 2022,
    'D': 2013, 'P': 2023,
    'E': 2014, 'R': 2024,
    'F': 2015, 'S': 2025,
    'G': 2016, 'T': 2026,
    'H': 2017, 'V': 2027,
    'J': 2018, 'W': 2028,
    'K': 2019, 'X': 2029,
  };
  
  // Check 2010-2029 range first
  if (codeYearMap[code]) {
    return codeYearMap[code];
  }
  
  // Handle older codes (1980-2009)
  const oldCodeYearMap: { [key: string]: number } = {
    'A': 1980, 'L': 1990, 'Y': 2000,
    'B': 1981, 'M': 1991, '1': 2001,
    'C': 1982, 'N': 1992, '2': 2002,
    'D': 1983, 'P': 1993, '3': 2003,
    'E': 1984, 'R': 1994, '4': 2004,
    'F': 1985, 'S': 1995, '5': 2005,
    'G': 1986, 'T': 1996, '6': 2006,
    'H': 1987, 'V': 1997, '7': 2007,
    'J': 1988, 'W': 1998, '8': 2008,
    'K': 1989, 'X': 1999, '9': 2009,
  };
  
  return oldCodeYearMap[code] || currentYear;
};

// Decode VIN to get vehicle info
export const decodeVIN = (vin: string): VINInfo => {
  const vinInfo: VINInfo = {
    vin,
    valid: false,
  };
  
  const validation = validateVIN(vin);
  if (!validation.valid) {
    vinInfo.errors = validation.errors;
    return vinInfo;
  }
  
  vinInfo.valid = true;
  
  // World Manufacturer Identifier (WMI) - positions 1-3
  const wmi = vin.substring(0, 3);
  vinInfo.vehicleType = getVehicleType(wmi);
  vinInfo.plantCountry = getPlantCountry(wmi);
  
  // Vehicle Descriptor Section (VDS) - positions 4-8
  const vds = vin.substring(3, 8);
  
  // Model/Make info from VDS
  vinInfo.make = getMakeFromVIN(vds);
  vinInfo.model = getModelFromVIN(vds);
  
  // Model Year - position 10
  const yearCode = vin.charAt(9);
  vinInfo.year = getYearFromCode(yearCode);
  
  // Sequential Number - positions 11-17
  vinInfo.sequentialNumber = vin.substring(10, 17);
  
  // Check digit
  vinInfo.checkDigit = vin.charAt(8);
  
  return vinInfo;
};

// Helper: Get vehicle type from WMI
const getVehicleType = (wmi: string): string => {
  const vehicleTypes: { [key: string]: string } = {
    '1G1': 'Passenger Car',
    '1G2': 'Passenger Car',
    '1GN': 'Multi-Purpose Vehicle',
    '1HG': 'Passenger Car',
    '4T1': 'Passenger Car',
    'WVW': 'Passenger Car',
    'VF1': 'Passenger Car',
    'SAJ': 'Passenger Car',
    'JHM': 'Passenger Car',
  };
  
  return vehicleTypes[wmi] || 'Unknown Vehicle Type';
};

// Helper: Get country from WMI
const getPlantCountry = (wmi: string): string => {
  const firstChar = wmi.charAt(0);
  const countries: { [key: string]: string } = {
    '1': 'United States',
    '2': 'Canada',
    '3': 'Mexico',
    '4': 'United States',
    '5': 'United States',
    '6': 'Australia',
    '7': 'New Zealand',
    '9': 'Brazil',
    'J': 'Japan',
    'K': 'South Korea',
    'L': 'China',
    'S': 'United Kingdom',
    'V': 'France/Spain',
    'W': 'Germany',
    'Y': 'Sweden/Finland',
    'Z': 'Italy',
  };
  
  return countries[firstChar] || 'Unknown Country';
};

// Helper: Get make from VIN
const getMakeFromVIN = (vds: string): string => {
  const makes: { [key: string]: string } = {
    '1G1': 'Chevrolet',
    '1G2': 'Pontiac',
    '1GN': 'GMC',
    '1HG': 'Honda',
    '4T1': 'Toyota',
    'WVW': 'Volkswagen',
    'VF1': 'Renault',
    'SAJ': 'Jaguar',
    'JHM': 'Honda',
    'KNA': 'Kia',
    '5YJ': 'Tesla',
  };
  
  return makes[vds.substring(0, 3)] || '';
};

// Helper: Get model from VIN
const getModelFromVIN = (vds: string): string => {
  return 'Model decoded from VIN';
};

// Barcode format types
export type BarcodeFormat = 
  | 'QR_CODE'
  | 'DATA_MATRIX'
  | 'EAN_13'
  | 'EAN_8'
  | 'UPC_A'
  | 'UPC_E'
  | 'CODE_39'
  | 'CODE_93'
  | 'CODE_128'
  | 'ITF'
  | 'PDF_417'
  | 'AZTEC'
  | 'UNKNOWN';

// Barcode format descriptions
export const BARCODE_FORMATS: { [key: string]: string } = {
  'QR_CODE': 'QR Code',
  'DATA_MATRIX': 'Data Matrix',
  'EAN_13': 'EAN-13',
  'EAN_8': 'EAN-8',
  'UPC_A': 'UPC-A',
  'UPC_E': 'UPC-E',
  'CODE_39': 'Code 39',
  'CODE_93': 'Code 93',
  'CODE_128': 'Code 128',
  'ITF': 'ITF',
  'PDF_417': 'PDF 417',
  'AZTEC': 'Aztec',
  'UNKNOWN': 'Unknown',
};

// VIN/Barcode scanner options
export interface ScannerOptions {
  formats?: BarcodeFormat[];
  scanMode?: 'continuous' | 'single';
  showOverlay?: boolean;
  overlayColor?: string;
  beepOnScan?: boolean;
  vibrateOnScan?: boolean;
}

// Scanned result
export interface ScanResult {
  success: boolean;
  data?: string;
  format?: string;
  error?: string;
}
