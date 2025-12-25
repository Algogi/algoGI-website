import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import BadgeSharePage from '@/components/christmas/BadgeSharePage';
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
      gameName: playData.gameName,
    };
  } catch (error) {
    console.error('Error fetching badge data:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  if (!token) {
    return {
      title: 'Badge Not Found | AlgoGI',
      description: 'This badge link is invalid.',
    };
  }

  const badgeData = await getBadgeData(token);

  if (!badgeData) {
    return {
      title: 'Badge Not Found | AlgoGI',
      description: 'This badge link is invalid or has expired.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://algogi.com';
  const badgeUrl = `${baseUrl}/christmas/badge/${token}`;
  const ogImageUrl = `${baseUrl}/christmas/badge/${token}/opengraph-image`;

  const title = `I won ${badgeData.prize.name}! | AlgoGI Christmas Campaign`;
  const description = badgeData.prize.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: badgeUrl,
      type: 'website',
      siteName: 'AlgoGI',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${badgeData.prize.name} - AlgoGI Christmas Campaign`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: badgeUrl,
    },
  };
}

export default async function BadgePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    redirect('/christmas');
  }

  return <BadgeSharePage token={token} />;
}

