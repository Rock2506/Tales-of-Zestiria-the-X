import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Bill } from '../types/bill';

/**
 * Downloads an HTML element (the bill preview sheet) directly as a PDF file
 */
export async function downloadBillAsPDF(
  element: HTMLElement,
  filename: string = 'bill_invoice'
): Promise<void> {
  try {
    // Generate high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x for retina sharp rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins on left & right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // 10mm top margin

    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Multi-page handling if bill is very long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    const cleanFilename = filename.replace(/[^a-z0-9_\-]/gi, '_');
    pdf.save(`${cleanFilename}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    // Fallback: trigger print dialog if canvas generation fails
    window.print();
  }
}

/**
 * Downloads the bill receipt directly as a high-quality PNG image
 */
export async function downloadBillAsImage(
  element: HTMLElement,
  filename: string = 'bill_receipt'
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const cleanFilename = filename.replace(/[^a-z0-9_\-]/gi, '_');
    link.download = `${cleanFilename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to generate image:', error);
    throw error;
  }
}

/**
 * Downloads the bill data as a JSON file
 */
export function downloadBillAsJSON(bill: Bill): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bill, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${bill.billNumber || 'bill'}_data.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
