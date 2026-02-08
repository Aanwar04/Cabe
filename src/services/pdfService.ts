import { Platform } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Report, PDFOptions, CarReportData, ProjectReportData, ReportImage, ReportSummary, InspectorInfo } from '../types/report';
import { Car, Project } from '../types';

// Default PDF options
const DEFAULT_OPTIONS: Partial<PDFOptions> = {
  title: 'Car360 Inspection Report',
  subtitle: undefined,
  includeTimestamp: true,
  includeSignature: false,
  imageQuality: 'medium',
  pageSize: 'A4',
  orientation: 'portrait',
};

// PDF Service
export const pdfService = {
  /**
   * Generate a PDF report for a car inspection
   */
  generateCarReport: async (
    car: Car,
    project?: Project,
    options: Partial<PDFOptions> = {}
  ): Promise<string> => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    // Build report data
    const report: Report = {
      id: `report_${Date.now()}`,
      title: finalOptions.title,
      subtitle: finalOptions.subtitle || `${car.year} ${car.make} ${car.model}`,
      generatedAt: new Date(),
      car: {
        make: car.make,
        model: car.model,
        year: car.year,
        vin: car.vin,
        mileage: car.mileage,
        price: car.price,
        condition: car.condition,
      },
      project: project
        ? {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            createdAt: project.createdAt,
          }
        : undefined,
      summary: {
        totalImages: car.images.length,
        overallCondition: mapConditionToRating(car.condition),
        keyFindings: [],
        recommendations: [],
      },
      images: car.images.map((uri, index) => ({
        id: `img_${index}`,
        uri,
        category: 'other' as const,
      })),
      footer: {
        companyName: 'Car360',
        website: 'www.car360.com',
      },
    };

    // Generate PDF file path
    const fileName = `Car360_${car.make}_${car.model}_${Date.now()}.pdf`;
    const filePath = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
      android: `${RNFS.ExternalDirectoryPath}/${fileName}`,
    });

    // Generate the PDF content (simple text-based for now)
    const pdfContent = buildSimplePDF(report, finalOptions);

    // Write to file
    await RNFS.writeFile(filePath!, pdfContent, 'utf8');

    return filePath;
  },

  /**
   * Generate a PDF report from report data
   */
  generateReport: async (report: Report, options: Partial<PDFOptions> = {}): Promise<string> => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    const fileName = `Car360_Report_${Date.now()}.pdf`;
    const filePath = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
      android: `${RNFS.ExternalDirectoryPath}/${fileName}`,
    });

    const pdfContent = buildSimplePDF(report, finalOptions);
    await RNFS.writeFile(filePath!, pdfContent, 'utf8');

    return filePath;
  },

  /**
   * Share PDF file
   */
  sharePDF: async (filePath: string, title: string = 'Share Report'): Promise<void> => {
    try {
      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
        title,
      });
    } catch (error) {
      console.error('Share error:', error);
      throw error;
    }
  },

  /**
   * Get PDF file size
   */
  getFileSize: async (filePath: string): Promise<string> => {
    try {
      const stats = await RNFS.stat(filePath);
      const sizeInBytes = stats.size;
      const sizeInKB = sizeInBytes / 1024;
      const sizeInMB = sizeInKB / 1024;

      if (sizeInMB >= 1) {
        return `${sizeInMB.toFixed(2)} MB`;
      }
      return `${sizeInKB.toFixed(2)} KB`;
    } catch (error) {
      return 'Unknown';
    }
  },

  /**
   * Delete PDF file
   */
  deletePDF: async (filePath: string): Promise<void> => {
    try {
      await RNFS.unlink(filePath);
    } catch (error) {
      console.error('Delete error:', error);
    }
  },

  /**
   * Check if PDF file exists
   */
  exists: async (filePath: string): Promise<boolean> => {
    return await RNFS.exists(filePath);
  },

  /**
   * List all PDF files in directory
   */
  listPDFs: async (): Promise<string[]> => {
    const dirPath = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.ExternalDirectoryPath,
    });

    try {
      const files = await RNFS.readDir(dirPath!);
      return files
        .filter(file => file.isFile() && file.name.endsWith('.pdf'))
        .map(file => file.path);
    } catch (error) {
      console.error('List PDFs error:', error);
      return [];
    }
  },
};

// Helper: Map condition string to rating
function mapConditionToRating(condition?: string): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (!condition) return 'Good';
  
  const lower = condition.toLowerCase();
  if (lower.includes('excellent') || lower.includes('mint')) return 'Excellent';
  if (lower.includes('good') || lower.includes('great')) return 'Good';
  if (lower.includes('fair') || lower.includes('average')) return 'Fair';
  return 'Poor';
}

// Helper: Build simple PDF content (text-based, can be replaced with proper PDF lib)
function buildSimplePDF(report: Report, options: Partial<PDFOptions>): string {
  let content = `
========================================
${report.title.toUpperCase()}
========================================

`;

  // Title page info
  if (report.subtitle) {
    content += `Vehicle: ${report.subtitle}\n\n`;
  }

  content += `Report Generated: ${report.generatedAt.toLocaleDateString()}\n`;
  content += `Report ID: ${report.id}\n\n`;

  // Inspector info
  if (report.inspector) {
    content += `------------------------------------
INSPECTOR INFORMATION
------------------------------------
`;
    if (report.inspector.name) content += `Name: ${report.inspector.name}\n`;
    if (report.inspector.email) content += `Email: ${report.inspector.email}\n`;
    if (report.inspector.company) content += `Company: ${report.inspector.company}\n`;
    content += '\n';
  }

  // Car details
  if (report.car) {
    content += `------------------------------------
VEHICLE INFORMATION
------------------------------------
`;
    content += `Make: ${report.car.make}\n`;
    content += `Model: ${report.car.model}\n`;
    content += `Year: ${report.car.year}\n`;
    if (report.car.vin) content += `VIN: ${report.car.vin}\n`;
    if (report.car.mileage) content += `Mileage: ${report.car.mileage.toLocaleString()} miles\n`;
    if (report.car.price) content += `Price: $${report.car.price.toLocaleString()}\n`;
    if (report.car.condition) content += `Condition: ${report.car.condition}\n`;
    content += '\n';
  }

  // Project info
  if (report.project) {
    content += `------------------------------------
PROJECT INFORMATION
------------------------------------
`;
    content += `Project Name: ${report.project.name}\n`;
    if (report.project.description) content += `Description: ${report.project.description}\n`;
    content += `Status: ${report.project.status}\n`;
    content += `Created: ${new Date(report.project.createdAt).toLocaleDateString()}\n`;
    content += '\n';
  }

  // Summary
  if (report.summary) {
    content += `------------------------------------
INSPECTION SUMMARY
------------------------------------
`;
    content += `Overall Condition: ${report.summary.overallCondition}\n`;
    content += `Total Photos: ${report.summary.totalImages}\n`;
    
    if (report.summary.keyFindings && report.summary.keyFindings.length > 0) {
      content += `\nKey Findings:\n`;
      report.summary.keyFindings.forEach((finding, index) => {
        content += `  ${index + 1}. ${finding}\n`;
      });
    }

    if (report.summary.recommendations && report.summary.recommendations.length > 0) {
      content += `\nRecommendations:\n`;
      report.summary.recommendations.forEach((rec, index) => {
        content += `  ${index + 1}. ${rec}\n`;
      });
    }
    content += '\n';
  }

  // Images
  if (report.images && report.images.length > 0) {
    content += `------------------------------------
INSPECTION PHOTOS (${report.images.length})
------------------------------------
`;
    report.images.forEach((image, index) => {
      content += `\nPhoto ${index + 1}:\n`;
      content += `  Category: ${image.category || 'N/A'}\n`;
      if (image.caption) content += `  Caption: ${image.caption}\n`;
      content += `  [Image URI: ${image.uri}]\n`;
    });
    content += '\n';
  }

  // Footer
  content += `========================================
Generated by Car360 Inspection App
${report.footer?.website || 'www.car360.com'}
========================================
`;

  return content;
}

// Helper to create report from car and project
export const createReportFromData = (
  car: Car,
  project?: Project,
  images?: ReportImage[],
  inspector?: InspectorInfo
): Report => {
  return {
    id: `report_${Date.now()}`,
    title: 'Vehicle Inspection Report',
    subtitle: `${car.year} ${car.make} ${car.model}`,
    generatedAt: new Date(),
    car: {
      make: car.make,
      model: car.model,
      year: car.year,
      vin: car.vin,
      mileage: car.mileage,
      price: car.price,
      condition: car.condition,
    },
    project: project
      ? {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
        }
      : undefined,
    inspector,
    summary: {
      totalImages: images?.length || car.images.length,
      overallCondition: mapConditionToRating(car.condition),
      keyFindings: [],
      recommendations: [],
    },
    images: images || car.images.map((uri, index) => ({
      id: `img_${index}`,
      uri,
      category: 'other' as const,
    })),
    footer: {
      companyName: 'Car360',
      website: 'www.car360.com',
    },
  };
};

export default pdfService;
