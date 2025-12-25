import { ImageResponse } from 'next/og';
import { getDb } from '@/lib/firebase/config';
import { isTokenExpired } from '@/lib/christmas/badge-token';
import { getPrizeById } from '@/lib/christmas/prizes';
import { getCharacterById } from '@/lib/christmas/characters';

async function getBadgeData(token: string) {
  try {
    // Check if token is expired (only in production, allow in dev for testing)
    if (process.env.NODE_ENV === 'production' && isTokenExpired()) {
      return null;
    }

    // Find game play by badge token
    const db = getDb();
    const gamePlays = await db
      .collection('christmas_game_plays')
      .where('badgeToken', '==', token)
      .where('campaign', '==', 'christmas_2025')
      .limit(1)
      .get();

    if (gamePlays.empty) {
      return null;
    }

    const playData = gamePlays.docs[0].data();

    // Check if token has expired (individual expiration check)
    if (process.env.NODE_ENV === 'production' && playData.expiresAt) {
      let expirationDate: Date;
      // Handle Firestore Timestamp with toDate method
      if (playData.expiresAt.toDate && typeof playData.expiresAt.toDate === 'function') {
        expirationDate = playData.expiresAt.toDate();
      }
      // Handle Firestore Timestamp with seconds/nanoseconds (serialized format)
      else if (playData.expiresAt.seconds !== undefined || playData.expiresAt._seconds !== undefined) {
        const seconds = playData.expiresAt.seconds || playData.expiresAt._seconds || 0;
        const nanoseconds = playData.expiresAt.nanoseconds || playData.expiresAt._nanoseconds || 0;
        expirationDate = new Date(seconds * 1000 + nanoseconds / 1000000);
      }
      // Handle Date object or other formats
      else {
        expirationDate = playData.expiresAt instanceof Date ? playData.expiresAt : new Date(playData.expiresAt);
      }
      if (new Date() >= expirationDate) {
        return null;
      }
    }

    // Get prize information
    const prize = getPrizeById(playData.prizeId);
    if (!prize) {
      return null;
    }

    // Get character information
    const character = playData.characterId ? getCharacterById(playData.characterId) : null;

    return {
      prize: {
        id: prize.id,
        name: prize.name,
        description: prize.description,
        type: prize.type,
      },
      character: character ? {
        id: character.id,
        name: character.name,
        emoji: character.emoji,
        description: character.description,
      } : null,
    };
  } catch (error) {
    console.error('Error fetching badge data for OG image:', error);
    return null;
  }
}

export const alt = 'Christmas Badge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const badgeData = await getBadgeData(token);

  // Fallback image if badge not found
  if (!badgeData) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #22c55e 100%)',
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>🎄</div>
          <div>AlgoGI Christmas Campaign</div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const emoji = badgeData.character?.emoji || '🎁';
  const prizeName = badgeData.prize.name;
  const prizeDescription = badgeData.prize.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #22c55e 100%)',
          position: 'relative',
        }}
      >
        {/* Badge Circle */}
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fb923c 0%, #fbbf24 50%, #22c55e 100%)',
            border: '8px solid #fbbf24',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 50px rgba(251, 191, 36, 0.6), 0 0 100px rgba(34, 197, 94, 0.4)',
            marginBottom: 30,
          }}
        >
          {/* Emoji */}
          <div
            style={{
              fontSize: 120,
              marginBottom: 20,
            }}
          >
            {emoji}
          </div>
          {/* Prize Name */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              padding: '0 40px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {prizeName}
          </div>
        </div>
        {/* Prize Description */}
        <div
          style={{
            fontSize: 24,
            color: '#fbbf24',
            textAlign: 'center',
            maxWidth: 900,
            padding: '0 60px',
            fontWeight: 600,
            textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)',
          }}
        >
          {prizeDescription}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

