import { Outlet, useLocation, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BottomNav from './BottomNav';
import GuidedWalkthrough from './GuidedWalkthrough';
import SafetySetupWalkthrough from './SafetySetupWalkthrough';
import NotificationBell from './NotificationBell';
import MatchCelebration from './MatchCelebration';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Heart, Compass, MessageCircle, User, Crown, Shield, Settings, ClipboardList, Calendar } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebrationMatch, setCelebrationMatch] = useState(null);
  useTheme();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    base44.entities.Profile.filter({ created_by_id: user.id })
      .then((profiles) => { setProfile(profiles[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!profile || celebrationMatch) return;
    let active = true;
    const checkNewMatches = async () => {
      if (!active || celebrationMatch) return;
      try {
        const unread = await base44.entities.Notification.filter(
          { user_id: profile.created_by_id, type: 'match', is_read: false },
          '-created_date',
          5
        );
        if (unread.length > 0 && active) {
          const notif = unread[0];
          await base44.entities.Notification.update(notif.id, { is_read: true });
          if (notif.related_profile_id) {
            const otherProfile = await base44.entities.Profile.get(notif.related_profile_id);
            if (active) setCelebrationMatch(otherProfile);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkNewMatches();
    const interval = setInterval(checkNewMatches, 8000);
    return () => { active = false; clearInterval(interval); };
  }, [profile, celebrationMatch]);

  if (!user) return <Navigate to="/" replace />;
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!profile || !profile.is_onboarded) return <Navigate to="/onboarding" replace />;

  const hideNav = location.pathname.startsWith('/chat');
  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/matches', label: 'Matches', icon: Heart },
    { to: '/messages', label: 'Messages', icon: MessageCircle },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/safety-hub', label: 'Safety Hub', icon: Shield },
    { to: '/premium', label: 'Premium', icon: Crown },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!hideNav && (
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
          <Link to="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="text-primary-foreground fill-primary-foreground" size={16} />
            </div>
            <span className="font-heading font-bold text-lg">Trust Matches</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition ${
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  to="/onboarding-dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition ${
                    location.pathname === '/onboarding-dashboard'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <ClipboardList size={16} />
                  Onboarding
                </Link>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition ${
                    location.pathname === '/admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Shield size={16} />
                  Admin
                </Link>
              </>
            )}
            <NotificationBell profile={profile} />
          </nav>
        </header>
      )}
      <main className={`flex-1 ${hideNav ? '' : 'pb-20 md:pb-0'}`}>
        <Outlet context={{ profile, setProfile }} />
      </main>
      {!hideNav && <BottomNav />}
      <SafetySetupWalkthrough profile={profile} />
      <GuidedWalkthrough />
      <MatchCelebration match={celebrationMatch} onClose={() => setCelebrationMatch(null)} />
    </div>
  );
}