import PDFDocument from 'pdfkit-browserify';
import { Readable } from 'stream';

// No need for the filesystem access workaround when using pdfkit-browserify
// as it's already designed to work without filesystem access

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  paymentId: string;
  transactionId: string;
  caseNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
}

export async function generateInvoice(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF with default fonts only
      const doc = new PDFDocument({ 
        margin: 50,
        font: 'Helvetica' // Use built-in font
      });
      
      // Collect the PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Format the date
      const formattedDate = new Date(data.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Format the currency
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: data.currency,
      });
      
      // Add the header - Logo and company information
      doc
        .fontSize(20)
        .text('Online Case Filing System', { align: 'center' })
        .fontSize(12)
        .text('Gauhati High Court', { align: 'center' })
        .moveDown(0.5)
        .text('Tax Invoice', { align: 'center' })
        .moveDown(2);
      
      // Add invoice details
      doc
        .fontSize(12)
        .text(`Invoice Number: ${data.invoiceNumber}`, { align: 'right' })
        .text(`Date: ${formattedDate}`, { align: 'right' })
        .moveDown(1);
      
      // Add customer information
      doc
        .text('Billed To:', { continued: true })
        .text(`Case Number: ${data.caseNumber}`, { align: 'right' })
        .text(`${data.customerName}`, { continued: true })
        .text(`Payment ID: ${data.paymentId}`, { align: 'right' });
      
      if (data.customerEmail) {
        doc.text(`${data.customerEmail}`);
      }
      
      doc.moveDown(1);
      
      // Add a horizontal line
      doc.moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(0.5);
      
      // Add invoice table headers
      doc.fontSize(10)
        .text('Description', 50, doc.y, { width: 250 })
        .text('Amount', 300, doc.y, { width: 100 })
        .text('Total', { align: 'right' })
        .moveDown(0.5);
      
      // Add invoice table content
      doc.text(data.description, 50, doc.y, { width: 250 })
        .text(formatter.format(data.amount), 300, doc.y, { width: 100 })
        .text(formatter.format(data.amount), { align: 'right' })
        .moveDown(0.5);
      
      // Add a horizontal line
      doc.moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .stroke()
        .moveDown(0.5);
      
      // Add total
      doc.fontSize(12)
        .text('Total:', 300, doc.y)
        .text(formatter.format(data.amount), { align: 'right' })
        .moveDown(2);
      
      // Add payment information
      doc.fontSize(10)
        .text('Payment Information:')
        .text(`Method: ${data.paymentMethod}`)
        .text(`Transaction ID: ${data.transactionId}`)
        .moveDown(1);
      
      // Add footer
      doc.fontSize(10)
        .text('Thank you for using the Online Case Filing System.', { align: 'center' })
        .text('This is a computer-generated invoice and does not require a signature.', { align: 'center' })
        .moveDown(0.5)
        .text('For any questions regarding this invoice, please contact the court registry.', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
} 