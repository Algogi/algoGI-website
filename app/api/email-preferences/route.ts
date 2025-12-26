import { NextRequest, NextResponse } from 'next/server';
import { validateUnsubscribeToken, UnsubscribeTokenData } from '@/lib/email/unsubscribe-token';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { ContactStatus } from '@/lib/types/contact';

/**
 * GET /api/email-preferences
 * Get current email preferences for a token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token
    const tokenData = validateUnsubscribeToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Find contact by email
    const contactsSnapshot = await db
      .collection('contacts')
      .where('email', '==', tokenData.email.toLowerCase())
      .limit(1)
      .get();

    if (contactsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const contactDoc = contactsSnapshot.docs[0];
    const contact = contactDoc.data();

    // Return current preferences
    const preferences = contact.emailPreferences || {
      newsletter: true,
      marketing: true,
      updates: true,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      email: tokenData.email,
      status: contact.status,
      preferences,
      campaignId: tokenData.campaignId,
    });
  } catch (error: any) {
    console.error('Error getting email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-preferences
 * Update email preferences or unsubscribe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, preferences, unsubscribeAll } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token
    const tokenData = validateUnsubscribeToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Find contact by email
    const contactsSnapshot = await db
      .collection('contacts')
      .where('email', '==', tokenData.email.toLowerCase())
      .limit(1)
      .get();

    if (contactsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const contactDoc = contactsSnapshot.docs[0];
    const contactRef = contactDoc.ref;
    const currentData = contactDoc.data();

    const updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Handle unsubscribe all
    if (unsubscribeAll === true) {
      updates.status = 'unsubscribed' as ContactStatus;
      updates.emailPreferences = {
        newsletter: false,
        marketing: false,
        updates: false,
        lastUpdated: new Date().toISOString(),
      };

      // Log webhook event
      await db.collection('contact_webhook_events').add({
        contactId: contactDoc.id,
        email: tokenData.email,
        event: 'unsubscribed',
        timestamp: FieldValue.serverTimestamp(),
        metadata: {
          source: 'preference_center',
          campaignId: tokenData.campaignId,
          unsubscribeAll: true,
        },
      });
    } else if (preferences) {
      // Update specific preferences
      updates.emailPreferences = {
        newsletter: preferences.newsletter !== undefined ? preferences.newsletter : (currentData.emailPreferences?.newsletter ?? true),
        marketing: preferences.marketing !== undefined ? preferences.marketing : (currentData.emailPreferences?.marketing ?? true),
        updates: preferences.updates !== undefined ? preferences.updates : (currentData.emailPreferences?.updates ?? true),
        lastUpdated: new Date().toISOString(),
      };

      // If all preferences are false, set status to unsubscribed
      if (
        !updates.emailPreferences.newsletter &&
        !updates.emailPreferences.marketing &&
        !updates.emailPreferences.updates
      ) {
        updates.status = 'unsubscribed' as ContactStatus;
      } else if (currentData.status === 'unsubscribed') {
        // If user was unsubscribed but now subscribing to something, set to verified
        updates.status = 'verified' as ContactStatus;
      }

      // Log preference update event
      await db.collection('contact_webhook_events').add({
        contactId: contactDoc.id,
        email: tokenData.email,
        event: 'preferences_updated',
        timestamp: FieldValue.serverTimestamp(),
        metadata: {
          source: 'preference_center',
          campaignId: tokenData.campaignId,
          preferences: updates.emailPreferences,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Either preferences or unsubscribeAll must be provided' },
        { status: 400 }
      );
    }

    // Update contact
    await contactRef.update(updates);

    return NextResponse.json({
      success: true,
      email: tokenData.email,
      status: updates.status || currentData.status,
      preferences: updates.emailPreferences || currentData.emailPreferences,
    });
  } catch (error: any) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    );
  }
}


