import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Business from '@/models/Business';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Dynamically import jsPDF for server-side rendering
async function getJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  return jsPDF;
}

export async function GET(req, { params }) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const invoice = await Invoice.findOne({
      _id: params.id,
      businessId: business._id,
    })
      .populate('customerId')
      .lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Create PDF
    const jsPDF = await getJsPDF();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    // Business details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(business.name, margin, yPos);
    yPos += 5;
    if (business.logo) {
      // Logo would be added here if available
    }

    // Invoice details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
    doc.text(`Status: ${invoice.status}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;

    // Customer details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.customerId.name, margin, yPos);
    yPos += 5;
    if (invoice.customerId.email) {
      doc.text(invoice.customerId.email, margin, yPos);
      yPos += 5;
    }
    if (invoice.customerId.address) {
      doc.text(invoice.customerId.address, margin, yPos);
      yPos += 5;
    }
    yPos += 10;

    // Items table
    const tableData = invoice.items.map(item => [
      item.name,
      item.quantity.toString(),
      business.currency + ' ' + item.price.toFixed(2),
      business.currency + ' ' + item.total.toFixed(2),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Item', 'Quantity', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Totals
    doc.setFontSize(10);
    doc.text(`Subtotal: ${business.currency} ${invoice.subTotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });
    if (invoice.taxAmount > 0) {
      doc.text(`Tax (${business.taxRate}%): ${business.currency} ${invoice.taxAmount.toFixed(2)}`, pageWidth - margin, finalY + 5, { align: 'right' });
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${business.currency} ${invoice.totalAmount.toFixed(2)}`, pageWidth - margin, finalY + (invoice.taxAmount > 0 ? 12 : 7), { align: 'right' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

