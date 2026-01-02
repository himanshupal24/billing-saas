import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import LedgerEntry from '@/models/LedgerEntry';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
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

    // Total sales (sum of all FINAL invoices)
    const totalSalesResult = await Invoice.aggregate([
      {
        $match: {
          businessId: business._id,
          status: 'FINAL',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    // Outstanding amount (sum of all customer balances)
    const outstandingResult = await Customer.aggregate([
      {
        $match: {
          businessId: business._id,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$currentBalance' },
        },
      },
    ]);
    const outstandingAmount = outstandingResult.length > 0 ? outstandingResult[0].total : 0;

    // Pending payments (invoices with status FINAL but balance > 0)
    // This is the same as outstanding for now, but can be refined
    const pendingPayments = outstandingAmount;

    // Recent invoices
    const recentInvoices = await Invoice.find({
      businessId: business._id,
    })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Customer count
    const customerCount = await Customer.countDocuments({
      businessId: business._id,
    });

    return NextResponse.json({
      metrics: {
        totalSales,
        pendingPayments,
        outstandingAmount,
        customerCount,
      },
      recentInvoices,
      currency: business.currency,
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

