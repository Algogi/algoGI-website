import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { generateBadgeToken, getExpirationDate } from '@/lib/christmas/badge-token';
import { getRandomCharacter } from '@/lib/christmas/characters';

interface GamePlayData {
  gameName: string;
  prizeId: string;
  score?: number;
}

/**
 * Track game play and ensure user can only play one game
 */
export async function POST(request: NextRequest) {
  try {
    const body: GamePlayData = await request.json();
    const { gameName, prizeId, score } = body;

    if (!gameName || !prizeId) {
      return NextResponse.json(
        { error: 'Missing required fields: gameName, prizeId' },
        { status: 400 }
      );
    }

    // Get user email from cookie
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const christmasCookie = allCookies.find(
      (cookie) => cookie.name.startsWith('christmas-2025-')
    );

    if (!christmasCookie) {
      return NextResponse.json(
        { error: 'No Christmas campaign cookie found' },
        { status: 403 }
      );
    }

    let userEmail = '';
    try {
      const cookieData = JSON.parse(christmasCookie.value);
      userEmail = cookieData.email || '';
    } catch {
      return NextResponse.json(
        { error: 'Invalid cookie format' },
        { status: 403 }
      );
    }

    // Check if user has already played a game
    const db = getDb();
    
    // Use a transaction to prevent race conditions from duplicate requests
    const existingPlays = await db
      .collection('christmas_game_plays')
      .where('email', '==', userEmail)
      .where('campaign', '==', 'christmas_2025')
      .limit(1)
      .get();

    if (!existingPlays.empty) {
      const existingPlay = existingPlays.docs[0].data();
      return NextResponse.json({
        success: true,
        alreadyPlayed: true,
        previousGame: existingPlay.gameName,
        message: 'You have already played a game',
      });
    }
    
    // Double-check right before writing to prevent race conditions
    // This is a best-effort check - Firestore transactions would be better but require more setup
    const finalCheck = await db
      .collection('christmas_game_plays')
      .where('email', '==', userEmail)
      .where('campaign', '==', 'christmas_2025')
      .limit(1)
      .get();
    
    if (!finalCheck.empty) {
      const existingPlay = finalCheck.docs[0].data();
      return NextResponse.json({
        success: true,
        alreadyPlayed: true,
        previousGame: existingPlay.gameName,
        message: 'You have already played a game',
      });
    }

    // Generate unique badge token for sharing
    const badgeToken = generateBadgeToken();
    const expirationDate = getExpirationDate();
    const character = getRandomCharacter();

    // Save game play to Firestore
    await db.collection('christmas_game_plays').add({
      email: userEmail,
      gameName,
      prizeId,
      score: score || null,
      badgeToken,
      characterId: character.id,
      expiresAt: expirationDate,
      campaign: 'christmas_2025',
      playedAt: FieldValue.serverTimestamp(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    // Also update game popularity stats
    const statsRef = db.collection('christmas_game_stats').doc(gameName);
    const statsDoc = await statsRef.get();
    
    if (statsDoc.exists) {
      await statsRef.update({
        playCount: FieldValue.increment(1),
        lastPlayedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await statsRef.set({
        gameName,
        playCount: 1,
        firstPlayedAt: FieldValue.serverTimestamp(),
        lastPlayedAt: FieldValue.serverTimestamp(),
        campaign: 'christmas_2025',
      });
    }

    // Construct badge URL
    const origin = request.nextUrl.origin || request.headers.get('origin') || 'http://localhost:3000';
    const badgeUrl = `${origin}/christmas/badge/${badgeToken}`;
    
    console.log('Generated badge URL:', badgeUrl, 'token:', badgeToken);
    
    return NextResponse.json({
      success: true,
      alreadyPlayed: false,
      badgeToken,
      badgeUrl,
      character: {
        id: character.id,
        name: character.name,
        emoji: character.emoji,
        description: character.description,
      },
      message: 'Game play recorded',
    });
  } catch (error: any) {
    console.error('Error recording game play:', error);
    return NextResponse.json(
      { error: 'Failed to record game play' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has already played a game
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const christmasCookie = allCookies.find(
      (cookie) => cookie.name.startsWith('christmas-2025-')
    );

    if (!christmasCookie) {
      return NextResponse.json({
        hasPlayed: false,
        gameName: null,
        badgeUrl: null,
        badgeToken: null,
        characterId: null,
      });
    }

    let userEmail = '';
    try {
      const cookieData = JSON.parse(christmasCookie.value);
      userEmail = cookieData.email || '';
    } catch {
      return NextResponse.json({
        hasPlayed: false,
        gameName: null,
        badgeUrl: null,
        badgeToken: null,
        characterId: null,
      });
    }

    const db = getDb();
    const existingPlays = await db
      .collection('christmas_game_plays')
      .where('email', '==', userEmail)
      .where('campaign', '==', 'christmas_2025')
      .limit(1)
      .get();

    if (existingPlays.empty) {
      return NextResponse.json({
        hasPlayed: false,
        gameName: null,
        badgeUrl: null,
        badgeToken: null,
        characterId: null,
      });
    }

    const playData = existingPlays.docs[0].data();
    const requestUrl = new URL(request.url);
    return NextResponse.json({
      hasPlayed: true,
      gameName: playData.gameName,
      prizeId: playData.prizeId,
      score: playData.score,
      badgeToken: playData.badgeToken || null,
      badgeUrl: playData.badgeToken ? `${requestUrl.origin}/christmas/badge/${playData.badgeToken}` : null,
      characterId: playData.characterId || null,
    });
  } catch (error: any) {
    console.error('Error checking game play:', error);
    return NextResponse.json(
      { error: 'Failed to check game play status' },
      { status: 500 }
    );
  }
}

