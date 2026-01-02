import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LedgerEntry from '@/models/LedgerEntry';
import Business from '@/models/Business';
import Customer from '@/models/Customer';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const query = { businessId: business._id };
    if (customerId) query.customerId = customerId;

    const entries = await LedgerEntry.find(query)
      .populate('customerId', 'name')
      .populate('relatedInvoiceId', 'invoiceNumber')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ entries });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get ledger entries error:', error);
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

    const { customerId, type, amount, reference, date } = await req.json();

    if (!customerId || !type || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Customer ID, type, and valid amount are required' },
        { status: 400 }
      );
    }

    if (!['CREDIT', 'DEBIT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be CREDIT or DEBIT' },
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

    // Create ledger entry
    const entry = new LedgerEntry({
      businessId: business._id,
      customerId,
      type,
      amount,
      reference: reference || '',
      date: date ? new Date(date) : new Date(),
    });

    await entry.save();

    // Update customer balance
    if (type === 'DEBIT') {
      customer.currentBalance += amount;
    } else {
      customer.currentBalance -= amount;
    }
    await customer.save();

    const populatedEntry = await LedgerEntry.findById(entry._id)
      .populate('customerId', 'name')
      .populate('relatedInvoiceId', 'invoiceNumber')
      .lean();

    return NextResponse.json(
      {
        success: true,
        entry: populatedEntry,
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
    console.error('Create ledger entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

