import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';

/**
 * GET /admin/contacts/api/verify/[jobId]
 * Get verification job progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;
    const db = getDb();
    const jobDoc = await db.collection('verification_jobs').doc(jobId).get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        { error: 'Verification job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();
    const progress = {
      jobId,
      total: jobData?.total || 0,
      processed: jobData?.processed || 0,
      status: jobData?.status || 'pending',
      currentEmail: jobData?.currentEmail || null,
      results: jobData?.results || null,
      error: jobData?.error || null,
      createdAt: jobData?.createdAt?.toDate?.()?.toISOString() || null,
      startedAt: jobData?.startedAt?.toDate?.()?.toISOString() || null,
      completedAt: jobData?.completedAt?.toDate?.()?.toISOString() || null,
      progressPercentage: jobData?.total
        ? Math.round(((jobData.processed || 0) / jobData.total) * 100)
        : 0,
    };

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error('Error fetching verification progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    );
  }
}

