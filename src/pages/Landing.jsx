import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingSafety from '@/components/landing/LandingSafety';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
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
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingSafety />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingFooter />
    </div>
  );
}