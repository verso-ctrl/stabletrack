import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, checkBarnPermission } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ barnId: string; clientId: string }>;
};

// GET /api/barns/[barnId]/clients/[clientId]/payment-method
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId, clientId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:read');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, barnId },
      select: {
        id: true,
        stripePaymentMethodId: true,
        paymentMethodType: true,
        paymentMethodLast4: true,
        paymentMethodBrand: true,
        paymentConsentGiven: true,
        paymentConsentDate: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        hasPaymentMethod: !!client.stripePaymentMethodId,
        paymentMethodType: client.paymentMethodType,
        paymentMethodLast4: client.paymentMethodLast4,
        paymentMethodBrand: client.paymentMethodBrand,
        paymentConsentGiven: client.paymentConsentGiven,
        paymentConsentDate: client.paymentConsentDate,
      },
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment method' },
      { status: 500 }
    );
  }
}

// PUT /api/barns/[barnId]/clients/[clientId]/payment-method
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId, clientId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, barnId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      paymentMethodId,
      paymentMethodType,
      paymentMethodLast4,
      paymentMethodBrand,
      consentGiven,
    } = body;

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Client consent is required to store payment information' },
        { status: 400 }
      );
    }

    if (!paymentMethodId || !paymentMethodType || !paymentMethodLast4) {
      return NextResponse.json(
        { error: 'Payment method details are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['card', 'us_bank_account'].includes(paymentMethodType)) {
      return NextResponse.json(
        { error: 'Payment method type must be "card" or "us_bank_account"' },
        { status: 400 }
      );
    }

    // Validate last4
    if (!/^\d{4}$/.test(paymentMethodLast4)) {
      return NextResponse.json(
        { error: 'Last 4 digits must be exactly 4 numbers' },
        { status: 400 }
      );
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        stripePaymentMethodId: paymentMethodId,
        paymentMethodType,
        paymentMethodLast4,
        paymentMethodBrand: paymentMethodBrand || null,
        paymentConsentGiven: true,
        paymentConsentDate: new Date(),
      },
      select: {
        id: true,
        stripePaymentMethodId: true,
        paymentMethodType: true,
        paymentMethodLast4: true,
        paymentMethodBrand: true,
        paymentConsentGiven: true,
        paymentConsentDate: true,
      },
    });

    return NextResponse.json({
      data: {
        hasPaymentMethod: true,
        paymentMethodType: updated.paymentMethodType,
        paymentMethodLast4: updated.paymentMethodLast4,
        paymentMethodBrand: updated.paymentMethodBrand,
        paymentConsentGiven: updated.paymentConsentGiven,
        paymentConsentDate: updated.paymentConsentDate,
      },
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}

// DELETE /api/barns/[barnId]/clients/[clientId]/payment-method
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { barnId, clientId } = await context.params;

    const hasPermission = await checkBarnPermission(user.id, barnId, 'clients:write');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, barnId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.update({
      where: { id: clientId },
      data: {
        stripePaymentMethodId: null,
        paymentMethodType: null,
        paymentMethodLast4: null,
        paymentMethodBrand: null,
        paymentConsentGiven: false,
        paymentConsentDate: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method' },
      { status: 500 }
    );
  }
}
