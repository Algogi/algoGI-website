import Questionnaire from '@/components/christmas/Questionnaire';
import SnowfallBackground from '@/components/christmas/SnowfallBackground';
import ChristmasPageClient from '@/components/christmas/ChristmasPageClient';

export default function ChristmasPage() {
  return (
    <>
      <ChristmasPageClient />
      <div className="min-h-screen christmas-page-bg relative overflow-hidden">
        <SnowfallBackground />
        <Questionnaire />
      </div>
    </>
  );
}

