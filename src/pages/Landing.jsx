import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingFoundingMember from '@/components/landing/LandingFoundingMember';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingHowVerificationWorks from '@/components/landing/LandingHowVerificationWorks';
import LandingDateSafetyTracker from '@/components/landing/LandingDateSafetyTracker';
import LandingSafetyGrid from '@/components/landing/LandingSafetyGrid';
import LandingSafetyBanner from '@/components/landing/LandingSafetyBanner';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingStats from '@/components/landing/LandingStats';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingDownloadCTA from '@/components/landing/LandingDownloadCTA';
import LandingFAQ from '@/components/landing/LandingFAQ';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const { user, isLoadingAuth } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (user) {
      base44.entities.Profile.filter({ created_by_id: user.id })
        .then((profiles) => {
          if (profiles[0]?.is_onboarded) setRedirect(true);
        })
        .catch(() => {});
    }
  }, [user]);

  if (redirect) return <Navigate to="/discover" replace />;
  if (user && !isLoadingAuth) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <img
        src="https://media.base44.com/images/public/6a3ebc375433828e3faa9c58/8d88c8f12_IMG_7752.jpg"
        alt="Trust Matches — Real People. Real Connections. Built on Trust. Verified Identities, Privacy First, Date Safety Mode, Shared Experiences."
        className="w-full h-auto"
      />
      <LandingHero />
      <LandingStats />
      <LandingFoundingMember />
      <LandingHowItWorks />
      <LandingDateSafetyTracker />
      <LandingSafetyGrid />
      <LandingSafetyBanner />
      <LandingHowVerificationWorks />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFAQ />
      <LandingDownloadCTA />
      <LandingFooter />
    </div>
  );
}