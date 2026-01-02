import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import { requireAuth } from '@/lib/auth';

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

