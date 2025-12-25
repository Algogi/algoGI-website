import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Store Christmas questionnaire analytics events in Firestore
 * This allows the admin page to display abandonment and question view data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, step, questionId, stepType, totalSteps, progressPercent } = body;

    if (!eventType || step === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: eventType, step' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    await db.collection('christmas_analytics_events').add({
      eventType, // 'questionnaire_abandoned' or 'question_view'
      step,
      questionId: questionId || null,
      stepType: stepType || 'unknown',
      totalSteps: totalSteps || 12,
      progressPercent: progressPercent || 0,
      campaign: 'christmas_2025',
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error storing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics event' },
      { status: 500 }
    );
  }
}

