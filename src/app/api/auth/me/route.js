import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const userId = await requireAuth(req);
    await connectDB();

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let business = null;
    let hasBusiness = false;

    if (user.businessId) {
      business = await Business.findById(user.businessId);
      hasBusiness = business && business.name !== `${user.name}'s Business`;
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
        hasBusiness,
        business: business
          ? {
              id: business._id,
              name: business.name,
              currency: business.currency,
              taxType: business.taxType,
              taxRate: business.taxRate,
              logo: business.logo,
            }
          : null,
      },
    });
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('token')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

