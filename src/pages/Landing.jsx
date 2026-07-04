import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingPrivacyBanner from '@/components/landing/LandingPrivacyBanner';
import LandingFoundingMember from '@/components/landing/LandingFoundingMember';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingHowVerificationWorks from '@/components/landing/LandingHowVerificationWorks';
import LandingTrustScoreExplainer from '@/components/landing/LandingTrustScoreExplainer';
import LandingDateSafetyTracker from '@/components/landing/LandingDateSafetyTracker';
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
          if (profiles[0]?.is_onboarded && profiles[0]?.is_verified) setRedirect(true);
        })
        .catch(() => {});
    }
  }, [user]);

  if (redirect) return <Navigate to="/discover" replace />;
  if (user && !isLoadingAuth) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <LandingHero />
      <LandingPrivacyBanner />
      <LandingStats />
      <LandingFoundingMember />
      <LandingHowItWorks />
      <LandingDateSafetyTracker />
      <LandingSafetyBanner />
      <LandingHowVerificationWorks />
      <LandingTrustScoreExplainer />
      <LandingTestimonials />
      <LandingPricing />
      <LandingFAQ />
      <LandingDownloadCTA />
      <LandingFooter />
    </div>
  );
}