import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';
import { calculateInvoiceTotals } from '@/lib/utils';

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
      .populate('businessId')
      .lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const { items, status, taxRate } = await req.json();

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
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const wasFinal = invoice.status === 'FINAL';
    const customer = await Customer.findById(invoice.customerId);

    // If invoice was FINAL, reverse the ledger entry
    if (wasFinal && customer) {
      customer.currentBalance -= invoice.totalAmount;
      await customer.save();

      // Delete existing ledger entry
      await LedgerEntry.deleteOne({
        relatedInvoiceId: invoice._id,
      });
    }

    // Update invoice
    if (items && Array.isArray(items)) {
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

      invoice.items = items;
      const effectiveTaxRate = taxRate !== undefined ? taxRate : business.taxRate;
      const totals = calculateInvoiceTotals(items, effectiveTaxRate);
      invoice.subTotal = totals.subTotal;
      invoice.taxAmount = totals.taxAmount;
      invoice.totalAmount = totals.totalAmount;
    }

    if (status) {
      invoice.status = status;
    }

    await invoice.save();

    // If invoice is now FINAL, create ledger entry and update customer balance
    if (invoice.status === 'FINAL' && customer) {
      const ledgerEntry = new LedgerEntry({
        businessId: business._id,
        customerId: invoice.customerId,
        type: 'DEBIT',
        amount: invoice.totalAmount,
        reference: `Invoice ${invoice.invoiceNumber}`,
        relatedInvoiceId: invoice._id,
      });
      await ledgerEntry.save();

      customer.currentBalance += invoice.totalAmount;
      await customer.save();
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customerId', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      invoice: populatedInvoice,
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // If invoice is FINAL, reverse the ledger entry
    if (invoice.status === 'FINAL') {
      const customer = await Customer.findById(invoice.customerId);
      if (customer) {
        customer.currentBalance -= invoice.totalAmount;
        await customer.save();
      }

      await LedgerEntry.deleteOne({
        relatedInvoiceId: invoice._id,
      });
    }

    await invoice.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

