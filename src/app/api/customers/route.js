import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Business from '@/models/Business';
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

    const customers = await Customer.find({ businessId: business._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ customers });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get customers error:', error);
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

    const { name, phone, email, address } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
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

    const customer = new Customer({
      businessId: business._id,
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
      currentBalance: 0,
    });

    await customer.save();

    return NextResponse.json(
      {
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
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

