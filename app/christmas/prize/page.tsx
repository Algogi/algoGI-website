import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PrizePageClient from './PrizePageClient';

export default async function PrizePage() {
  // Check if user has cookie
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasCookie = allCookies.some(
    (cookie) => cookie.name.startsWith('christmas-2025-')
  );

  if (!hasCookie) {
    redirect('/christmas');
  }

  return <PrizePageClient />;
}

