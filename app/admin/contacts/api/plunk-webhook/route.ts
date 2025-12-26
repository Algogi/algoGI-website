import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { ContactStatus } from '@/lib/types/contact';

/**
 * POST /admin/contacts/api/plunk-webhook
 * Handle Plunk webhook events (bounced, delivered, opened, clicked, unsubscribed)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = request.headers.get('x-plunk-secret');
    const expectedSecret = process.env.PLUNK_WEBHOOK_SECRET;
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid webhook secret' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, email, timestamp, metadata } = body;

    if (!event || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: event, email' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Find contact by email
    const contactsSnapshot = await db
      .collection('contacts')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (contactsSnapshot.empty) {
      // Contact not found - might be a new email, log it
      console.log(`Webhook received for unknown email: ${email}`);
      return NextResponse.json({ success: true, message: 'Contact not found' });
    }

    const contactDoc = contactsSnapshot.docs[0];
    const contactRef = contactDoc.ref;
    const currentData = contactDoc.data();

    // Update contact based on event type
    const updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    let newStatus: ContactStatus | null = null;
    let engagementDelta = 0;

    switch (event) {
      case 'bounced':
        newStatus = 'bounced';
        break;
      
      case 'delivered':
        // Don't change status on delivered, but track it
        engagementDelta = 1;
        break;
      
      case 'opened':
        engagementDelta = 2;
        break;
      
      case 'clicked':
        engagementDelta = 3;
        break;
      
      case 'unsubscribed':
        newStatus = 'unsubscribed';
        break;
      
      default:
        console.log(`Unknown webhook event: ${event}`);
    }

    // Update status if needed
    if (newStatus && currentData.status !== newStatus) {
      updates.status = newStatus;
    }

    // Update engagement score
    if (engagementDelta > 0) {
      const currentScore = currentData.engagementScore || 0;
      updates.engagementScore = Math.min(currentScore + engagementDelta, 10); // Cap at 10
    }

    // Update last sent timestamp if this is a delivery event
    if (event === 'delivered' || event === 'opened' || event === 'clicked') {
      updates.lastSent = timestamp ? new Date(timestamp) : FieldValue.serverTimestamp();
    }

    // Store webhook event in a separate collection for analytics
    await db.collection('contact_webhook_events').add({
      contactId: contactDoc.id,
      email,
      event,
      timestamp: timestamp ? new Date(timestamp) : FieldValue.serverTimestamp(),
      metadata: metadata || {},
    });

    // Update contact
    await contactRef.update(updates);

    return NextResponse.json({ 
      success: true,
      contactId: contactDoc.id,
      event,
      status: newStatus || currentData.status,
    });
  } catch (error: any) {
    console.error('Error processing Plunk webhook:', error);
    // Return 200 to prevent Plunk from retrying
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 200 }
    );
  }
}

