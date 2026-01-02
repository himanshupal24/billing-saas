import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
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

    return NextResponse.json({
      business: {
        id: business._id,
        name: business.name,
        logo: business.logo,
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
    console.error('Get business error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const { name, currency, taxType, taxRate, logo } = await req.json();

    const business = await Business.findOne({ ownerId: userId });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (name) business.name = name;
    if (currency) business.currency = currency.toUpperCase();
    if (taxType !== undefined) business.taxType = taxType;
    if (taxRate !== undefined) business.taxRate = taxRate;
    if (logo !== undefined) business.logo = logo;

    await business.save();

    return NextResponse.json({
      success: true,
      business: {
        id: business._id,
        name: business.name,
        logo: business.logo,
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
    console.error('Update business error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

