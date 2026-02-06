import PDFLib from 'react-native-pdf-lib';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { Report, PDFOptions, CarReportData, ProjectReportData } from '../types/report';
import { Car, Project } from '../types';

interface PDFPage {
  width: number;
  height: number;
}

const A4_PORTRAIT: PDFPage = { width: 595, height: 842 };
const LETTER_PORTRAIT: PDFPage = { width: 612, height: 792 };

class PDFGenerator {
  private doc: PDFLib.PDFDocument | null = null;
  private page: PDFLib.PDFPage | null = null;
  private currentY: number = 0;
  private pageHeight: number = 0;
  private margin: number = 50;
  private lineHeight: number = 20;

  // Generate PDF report
  async generateReport(
    report: Report,
    options: PDFOptions
  ): Promise<string> {
    try {
      // Create new PDF document
      this.doc = await PDFLib.createPdf();
      
      // Set page size based on options
      const pageSize = options.pageSize === 'A4' ? A4_PORTRAIT : LETTER_PORTRAIT;
      this.pageHeight = pageSize.height;
      
      // Add title page
      await this.addTitlePage(report, options);
      
      // Add car details page
      if (report.car) {
        await this.addCarDetailsPage(report.car);
      }
      
      // Add project details if available
      if (report.project) {
        await this.addProjectDetailsPage(report.project);
      }
      
      // Add images page
      if (report.images && report.images.length > 0) {
        await this.addImagesPage(report.images);
      }
      
      // Add summary page
      if (report.summary) {
        await this.addSummaryPage(report.summary);
      }
      
      // Add footer to all pages
      await this.addFooter(report.footer);
      
      // Save PDF
      const pdfBytes = await this.doc.save();
      
      // Get file path
      const fileName = `Car360_Report_${Date.now()}.pdf`;
      const filePath = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
        android: `${RNFS.ExternalDirectoryPath}/${fileName}`,
      });
      
      // Write to file
      await RNFS.writeFile(filePath!, pdfBytes, 'base64');
      
      return filePath!;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  // Add title page
  private async addTitlePage(report: Report, options: PDFOptions): Promise<void> {
    this.page = await this.doc!.addPage(A4_PORTRAIT);
    const { width } = this.page.getSize();
    this.currentY = this.pageHeight - this.margin;

    // Company/Report Title
    await this.addText('Car360 Inspection Report', {
      x: width / 2,
      y: this.currentY - 80,
      size: 28,
      color: 'rgb(0, 122, 255)',
      align: 'center',
    });

    // Report Title
    await this.addText(report.title, {
      x: width / 2,
      y: this.currentY - 120,
      size: 22,
      color: 'rgb(0, 0, 0)',
      align: 'center',
    });

    // Subtitle
    if (report.subtitle || options.subtitle) {
      await this.addText(report.subtitle || options.subtitle!, {
        x: width / 2,
        y: this.currentY - 150,
        size: 14,
        color: 'rgb(100, 100, 100)',
        align: 'center',
      });
    }

    // Date
    if (options.includeTimestamp) {
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      await this.addText(dateStr, {
        x: width / 2,
        y: this.currentY - 200,
        size: 12,
        color: 'rgb(100, 100, 100)',
        align: 'center',
      });
    }

    // Inspector info
    if (report.inspector) {
      this.currentY = this.pageHeight - 300;
      await this.addText('Inspector Information', {
        x: this.margin,
        y: this.currentY,
        size: 14,
        color: 'rgb(0, 0, 0)',
      });
      
      this.currentY -= this.lineHeight;
      if (report.inspector.name) {
        await this.addText(`Name: ${report.inspector.name}`, {
          x: this.margin,
          y: this.currentY,
          size: 12,
          color: 'rgb(60, 60, 60)',
        });
        this.currentY -= this.lineHeight;
      }
      if (report.inspector.email) {
        await this.addText(`Email: ${report.inspector.email}`, {
          x: this.margin,
          y: this.currentY,
          size: 12,
          color: 'rgb(60, 60, 60)',
        });
        this.currentY -= this.lineHeight;
      }
      if (report.inspector.company) {
        await this.addText(`Company: ${report.inspector.company}`, {
          x: this.margin,
          y: this.currentY,
          size: 12,
          color: 'rgb(60, 60, 60)',
        });
      }
    }
  }

  // Add car details page
  private async addCarDetailsPage(car: CarReportData): Promise<void> {
    this.page = await this.doc!.addPage(A4_PORTRAIT);
    const { width } = this.page.getSize();
    this.currentY = this.pageHeight - this.margin;

    // Section title
    await this.addText('Vehicle Information', {
      x: this.margin,
      y: this.currentY,
      size: 18,
      color: 'rgb(0, 122, 255)',
    });
    this.currentY -= 30;

    // Car details
    const carFields = [
      { label: 'Make', value: car.make },
      { label: 'Model', value: car.model },
      { label: 'Year', value: car.year.toString() },
      { label: 'VIN', value: car.vin || 'N/A' },
      { label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} miles` : 'N/A' },
      { label: 'Price', value: car.price ? `$${car.price.toLocaleString()}` : 'N/A' },
      { label: 'Condition', value: car.condition || 'N/A' },
    ];

    for (const field of carFields) {
      await this.addText(`${field.label}: ${field.value}`, {
        x: this.margin,
        y: this.currentY,
        size: 12,
        color: 'rgb(0, 0, 0)',
      });
      this.currentY -= this.lineHeight;
    }
  }

  // Add project details page
  private async addProjectDetailsPage(project: ProjectReportData): Promise<void> {
    this.page = await this.doc!.addPage(A4_PORTRAIT);
    const { width } = this.page.getSize();
    this.currentY = this.pageHeight - this.margin;

    // Section title
    await this.addText('Project Information', {
      x: this.margin,
      y: this.currentY,
      size: 18,
      color: 'rgb(0, 122, 255)',
    });
    this.currentY -= 30;

    // Project details
    const projectFields = [
      { label: 'Project ID', value: project.id },
      { label: 'Name', value: project.name },
      { label: 'Description', value: project.description || 'N/A' },
      { label: 'Status', value: project.status },
      { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
    ];

    for (const field of projectFields) {
      await this.addText(`${field.label}: ${field.value}`, {
        x: this.margin,
        y: this.currentY,
        size: 12,
        color: 'rgb(0, 0, 0)',
      });
      this.currentY -= this.lineHeight;
    }
  }

  // Add images page
  private async addImagesPage(images: Report['images']): Promise<void> {
    const imagesPerRow = 2;
    const imageWidth = 230;
    const imageHeight = 150;
    let x = this.margin;
    let imagesInRow = 0;

    this.page = await this.doc!.addPage(A4_PORTRAIT);
    this.currentY = this.pageHeight - this.margin - 30;

    // Section title
    await this.addText('Inspection Photos', {
      x: this.margin,
      y: this.currentY,
      size: 18,
      color: 'rgb(0, 122, 255)',
    });
    this.currentY -= 30;

    for (const image of images!) {
      // Check if we need a new page
      if (this.currentY - imageHeight < this.margin) {
        this.page = await this.doc!.addPage(A4_PORTRAIT);
        this.currentY = this.pageHeight - this.margin;
      }

      // Add image placeholder (in real implementation, embed actual image)
      await this.addImagePlaceholder(x, this.currentY - imageHeight, imageWidth, imageHeight);
      
      // Add caption
      if (image.caption) {
        await this.addText(image.caption, {
          x,
          y: this.currentY - imageHeight - 20,
          size: 10,
          color: 'rgb(100, 100, 100)',
        });
      }

      // Add category tag
      if (image.category) {
        await this.addText(`[${image.category}]`, {
          x,
          y: this.currentY - imageHeight - 35,
          size: 9,
          color: 'rgb(0, 122, 255)',
        });
      }

      x += imageWidth + 20;
      imagesInRow++;

      if (imagesInRow >= imagesPerRow) {
        imagesInRow = 0;
        x = this.margin;
        this.currentY -= imageHeight + 50;
      }
    }
  }

  // Add image placeholder (rectangle with text)
  private async addImagePlaceholder(
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    // In real implementation, embed actual image using this.page.drawImage()
    // For now, just add a rectangle border
    await this.page!.drawRectangle({
      x,
      y,
      width,
      height,
      borderColor: 'rgb(200, 200, 200)',
      borderWidth: 1,
    });
    
    await this.page!.drawText('Image', {
      x: x + width / 2 - 25,
      y: y + height / 2,
      size: 14,
      color: 'rgb(150, 150, 150)',
    });
  }

  // Add summary page
  private async addSummaryPage(summary: Report['summary']): Promise<void> {
    this.page = await this.doc!.addPage(A4_PORTRAIT);
    const { width } = this.page.getSize();
    this.currentY = this.pageHeight - this.margin;

    // Section title
    await this.addText('Inspection Summary', {
      x: this.margin,
      y: this.currentY,
      size: 18,
      color: 'rgb(0, 122, 255)',
    });
    this.currentY -= 30;

    // Overall condition
    await this.addText(`Overall Condition: ${summary!.overallCondition}`, {
      x: this.margin,
      y: this.currentY,
      size: 14,
      color: 'rgb(0, 0, 0)',
    });
    this.currentY -= 30;

    // Total images
    await this.addText(`Total Photos: ${summary!.totalImages}`, {
      x: this.margin,
      y: this.currentY,
      size: 12,
      color: 'rgb(60, 60, 60)',
    });
    this.currentY -= 25;

    // Key findings
    if (summary!.keyFindings && summary!.keyFindings.length > 0) {
      await this.addText('Key Findings:', {
        x: this.margin,
        y: this.currentY,
        size: 14,
        color: 'rgb(0, 0, 0)',
      });
      this.currentY -= 25;

      for (const finding of summary!.keyFindings) {
        await this.addText(`• ${finding}`, {
          x: this.margin + 10,
          y: this.currentY,
          size: 11,
          color: 'rgb(60, 60, 60)',
        });
        this.currentY -= this.lineHeight;
      }
      this.currentY -= 15;
    }

    // Recommendations
    if (summary!.recommendations && summary!.recommendations.length > 0) {
      await this.addText('Recommendations:', {
        x: this.margin,
        y: this.currentY,
        size: 14,
        color: 'rgb(0, 0, 0)',
      });
      this.currentY -= 25;

      for (const rec of summary!.recommendations) {
        await this.addText(`• ${rec}`, {
          x: this.margin + 10,
          y: this.currentY,
          size: 11,
          color: 'rgb(60, 60, 60)',
        });
        this.currentY -= this.lineHeight;
      }
    }
  }

  // Add footer to all pages
  private async addFooter(footer?: Report['footer']): Promise<void> {
    // Note: PDF-lib doesn't easily support adding content to all pages after creation
    // This is a placeholder for footer implementation
    if (footer) {
      console.log('Footer info:', footer);
    }
  }

  // Helper method to add text
  private async addText(
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      color: string;
      align?: 'left' | 'center' | 'right';
    }
  ): Promise<void> {
    await this.page!.drawText(text, {
      x: options.x,
      y: options.y,
      size: options.size,
      color: options.color,
      align: options.align || 'left',
    });
  }
}

// Singleton instance
export const pdfGenerator = new PDFGenerator();

// Helper function to create report from car and project data
export const createReportFromData = (
  car: Car,
  project?: Project,
  images?: Report['images']
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
    summary: {
      totalImages: images?.length || car.images.length,
      overallCondition: car.condition
        ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) as
            | 'Excellent'
            | 'Good'
            | 'Fair'
            | 'Poor'
        : 'Good',
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

export default pdfGenerator;
