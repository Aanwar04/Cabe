// Report Types

export interface CarReportData {
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage?: number;
  price?: number;
  condition?: string;
}

export interface ProjectReportData {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface InspectorInfo {
  name?: string;
  email?: string;
  company?: string;
  signature?: string;
}

export interface ReportSummary {
  totalImages: number;
  overallCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  keyFindings?: string[];
  recommendations?: string[];
}

export interface ReportImage {
  id: string;
  uri: string;
  caption?: string;
  category?: 'exterior' | 'interior' | 'engine' | 'damage' | 'other';
  annotation?: string;
}

export interface ReportFooter {
  disclaimer?: string;
  companyName?: string;
  website?: string;
  phone?: string;
}

// Main Report interface
export interface Report {
  id: string;
  title: string;
  subtitle?: string;
  generatedAt: Date;
  car?: CarReportData;
  project?: ProjectReportData;
  inspector?: InspectorInfo;
  summary?: ReportSummary;
  images?: ReportImage[];
  footer?: ReportFooter;
}

// PDF Generation Options
export interface PDFOptions {
  title: string;
  subtitle?: string;
  includeTimestamp: boolean;
  includeSignature: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

// Report Template
export interface ReportTemplate {
  id: string;
  name: string;
  fields: ReportField[];
  layout: 'simple' | 'detailed' | 'compact';
}

export interface ReportField {
  key: string;
  label: string;
  show: boolean;
  order: number;
}

// Predefined templates
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'basic',
    name: 'Basic Report',
    layout: 'compact',
    fields: [
      { key: 'car', label: 'Car Details', show: true, order: 1 },
      { key: 'images', label: 'Photos', show: true, order: 2 },
      { key: 'summary', label: 'Summary', show: true, order: 3 },
    ],
  },
  {
    id: 'detailed',
    name: 'Detailed Inspection',
    layout: 'detailed',
    fields: [
      { key: 'car', label: 'Car Details', show: true, order: 1 },
      { key: 'project', label: 'Project Info', show: true, order: 2 },
      { key: 'summary', label: 'Summary', show: true, order: 3 },
      { key: 'images', label: 'Photos', show: true, order: 4 },
      { key: 'inspector', label: 'Inspector Info', show: true, order: 5 },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Summary',
    layout: 'simple',
    fields: [
      { key: 'car', label: 'Car Details', show: true, order: 1 },
      { key: 'summary', label: 'Summary', show: true, order: 2 },
    ],
  },
];
