import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const userId = await requireAuth(req);

    const { name, currency, taxType, taxRate } = await req.json();

    // Validation
    if (!name || !currency) {
      return NextResponse.json(
        { error: 'Business name and currency are required' },
        { status: 400 }
      );
    }

    if (taxType !== 'NONE' && (!taxRate || taxRate < 0 || taxRate > 100)) {
      return NextResponse.json(
        { error: 'Valid tax rate is required when tax type is not NONE' },
        { status: 400 }
      );
    }

    // Find user's business
    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business
    business.name = name;
    business.currency = currency.toUpperCase();
    business.taxType = taxType || 'NONE';
    business.taxRate = taxRate || 0;
    await business.save();

    // Create ONE demo customer account for demonstration
    const demoCustomer = new Customer({
      businessId: business._id,
      name: 'Demo Customer',
      phone: '+1-555-0100',
      email: 'demo@example.com',
      address: '123 Demo Street, Demo City, DC 12345',
      currentBalance: 0,
    });
    await demoCustomer.save();

    // Create demo invoice for the customer
    const invoiceNumber1 = generateInvoiceNumber(business._id);
    const items1 = [
      { name: 'Professional Services', quantity: 10, price: 50, total: 500 },
      { name: 'Consulting Hours', quantity: 5, price: 30, total: 150 },
    ];
    const totals1 = calculateInvoiceTotals(items1, business.taxRate);

    const invoice1 = new Invoice({
      businessId: business._id,
      customerId: demoCustomer._id,
      invoiceNumber: invoiceNumber1,
      items: items1,
      subTotal: totals1.subTotal,
      taxAmount: totals1.taxAmount,
      totalAmount: totals1.totalAmount,
      status: 'FINAL',
    });
    await invoice1.save();

    // Create ledger entry for invoice
    const ledger1 = new LedgerEntry({
      businessId: business._id,
      customerId: demoCustomer._id,
      type: 'DEBIT',
      amount: totals1.totalAmount,
      reference: `Invoice ${invoiceNumber1}`,
      relatedInvoiceId: invoice1._id,
    });
    await ledger1.save();

    // Update customer balance
    demoCustomer.currentBalance += totals1.totalAmount;
    await demoCustomer.save();

    return NextResponse.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        currency: business.currency,
        taxType: business.taxType,
        taxRate: business.taxRate,
      },
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

