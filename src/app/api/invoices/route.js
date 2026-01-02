import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const query = { businessId: business._id };
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ invoices });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const { customerId, items, status, taxRate } = await req.json();

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID and items are required' },
        { status: 400 }
      );
    }

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const customer = await Customer.findOne({
      _id: customerId,
      businessId: business._id,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.name || item.quantity <= 0 || item.price < 0) {
        return NextResponse.json(
          { error: 'Invalid item data' },
          { status: 400 }
        );
      }
      item.total = item.quantity * item.price;
    }

    // Get last invoice number
    const lastInvoice = await Invoice.findOne({ businessId: business._id })
      .sort({ invoiceNumber: -1 })
      .lean();

    const invoiceNumber = generateInvoiceNumber(
      business._id,
      lastInvoice?.invoiceNumber
    );

    // Calculate totals
    const effectiveTaxRate = taxRate !== undefined ? taxRate : business.taxRate;
    const totals = calculateInvoiceTotals(items, effectiveTaxRate);

    // Create invoice
    const invoice = new Invoice({
      businessId: business._id,
      customerId,
      invoiceNumber,
      items,
      subTotal: totals.subTotal,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      status: status || 'DRAFT',
    });

    await invoice.save();

    // If status is FINAL, create ledger entry and update customer balance
    if (invoice.status === 'FINAL') {
      const ledgerEntry = new LedgerEntry({
        businessId: business._id,
        customerId,
        type: 'DEBIT',
        amount: totals.totalAmount,
        reference: `Invoice ${invoiceNumber}`,
        relatedInvoiceId: invoice._id,
      });
      await ledgerEntry.save();

      customer.currentBalance += totals.totalAmount;
      await customer.save();
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email')
      .lean();

    return NextResponse.json(
      {
        success: true,
        invoice: populatedInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

