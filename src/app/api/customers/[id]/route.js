import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Business from '@/models/Business';
import Invoice from '@/models/Invoice';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    const customer = await Customer.findOne({
      _id: params.id,
      businessId: business._id,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get all invoices for this customer
    const invoices = await Invoice.find({
      customerId: customer._id,
      businessId: business._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get all ledger entries for this customer
    const ledgerEntries = await LedgerEntry.find({
      customerId: customer._id,
      businessId: business._id,
    })
      .populate('relatedInvoiceId', 'invoiceNumber')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        currentBalance: customer.currentBalance,
        createdAt: customer.createdAt,
      },
      invoices,
      ledgerEntries,
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get customer error:', error);
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

    const { name, phone, email, address } = await req.json();

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const customer = await Customer.findOne({
      _id: params.id,
      businessId: business._id,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (address !== undefined) customer.address = address;

    await customer.save();

    return NextResponse.json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        currentBalance: customer.currentBalance,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Update customer error:', error);
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

    const customer = await Customer.findOne({
      _id: params.id,
      businessId: business._id,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has invoices
    const invoiceCount = await Invoice.countDocuments({
      customerId: customer._id,
      businessId: business._id,
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing invoices' },
        { status: 400 }
      );
    }

    // Delete ledger entries
    await LedgerEntry.deleteMany({
      customerId: customer._id,
      businessId: business._id,
    });

    await customer.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

