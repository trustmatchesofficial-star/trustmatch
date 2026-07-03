import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PostDateFeedbackModal from '@/components/PostDateFeedbackModal';
import { ArrowLeft, Shield, MapPin, Mic, Lock, BadgeCheck, MoreVertical, Send, Star } from 'lucide-react';

export default function DateSafety() {
  const { matchId } = useParams();
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationOn, setLocationOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!profile || !matchId) return;
    const load = async () => {
      try {
        const m = await base44.entities.Match.get(matchId);
        setMatch(m);
        const otherId = m.user_a === profile.created_by_id ? m.user_b : m.user_a;
        const p = await base44.entities.Profile.get(otherId);
        setOtherProfile(p);
        const cis = await base44.entities.DateCheckIn.filter({ match_id: matchId, user_id: profile.created_by_id });
        setCheckIns(cis.sort((a, b) => new Date(a.check_in_time) - new Date(b.check_in_time)));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [profile, matchId]);

  const handleSafe = async (id) => {
    try {
      await base44.entities.DateCheckIn.update(id, { status: 'checked_in', checked_in_at: new Date().toISOString() });
      setCheckIns((cs) => cs.filter((c) => c.id !== id));
      setShowFeedback(true);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const otherName = otherProfile?.full_name || 'your match';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/chat/${matchId}`)} className="p-2 -ml-2 hover:bg-secondary rounded-full transition">
          <ArrowLeft size={22} />
        </button>
        <img
          src={otherProfile?.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100`}
          alt={otherProfile?.full_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="font-semibold truncate">{otherProfile?.full_name}</h2>
            {otherProfile?.is_verified && <BadgeCheck size={16} className="text-teal" />}
          </div>
          <p className="text-xs text-muted-foreground">{otherProfile?.location || 'Location not set'}</p>
        </div>
        <Shield size={20} className="text-teal" />
        <button className="p-2 hover:bg-secondary rounded-full transition">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Pending check-ins */}
        {checkIns.length > 0 && (
          <div className="bg-card rounded-3xl border border-teal/30 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-teal" />
              <h3 className="font-bold text-foreground">Check in when you're safe</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Tap "I'm safe" once you've arrived. If you don't check in by the planned time, we'll send a gentle alert to your emergency contact.
            </p>
            <div className="space-y-2">
              {checkIns.map((c) => {
                const overdue = new Date(c.check_in_time) < new Date();
                return (
                  <div key={c.id} className="bg-secondary/50 rounded-2xl p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.location_note || 'Date check-in'}</p>
                      <p className="text-xs text-muted-foreground">
                        Check in by {new Date(c.check_in_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      {overdue && <p className="text-xs text-gold mt-0.5">Overdue — alert pending</p>}
                    </div>
                    <button
                      onClick={() => handleSafe(c.id)}
                      className="px-4 py-2 rounded-full bg-teal text-accent-foreground text-sm font-semibold hover:bg-teal/90 transition shrink-0"
                    >
                      I'm safe
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Location Tracker */}
        <div className="bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-teal" />
              <h3 className="font-bold text-foreground">Location Tracker</h3>
              <span className="text-[10px] font-medium bg-teal/15 text-teal px-2 py-0.5 rounded-full">Private</span>
            </div>
            <button
              onClick={() => setLocationOn(!locationOn)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                locationOn ? 'border-teal bg-teal/10 text-teal' : 'border-border text-teal hover:bg-teal/5'
              }`}
            >
              {locationOn ? 'Turn off' : 'Turn on'}
            </button>
          </div>

          <div className="bg-gold/5 border border-gold/30 rounded-2xl p-3 mb-4 flex items-start gap-2">
            <Lock size={16} className="text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-gold/90 leading-relaxed">
              Only you and {otherName} can see this. Location history is saved securely and can be shared with police if needed.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-secondary/50 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center">
                <MapPin size={16} className="text-teal" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-muted-foreground">
                  {locationOn ? 'Town Centre, Swindon' : 'Tracking off'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {locationOn ? 'Updated less than a minute ago' : 'No location shared'}
                </p>
              </div>
              {locationOn && (
                <div className="w-10 h-5 rounded-full bg-teal relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-background" />
                </div>
              )}
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <MapPin size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{otherName}</p>
                <p className="text-xs text-muted-foreground">Tracking off</p>
                <p className="text-[10px] text-muted-foreground">No location shared</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Safety Recording */}
        <div className="bg-card rounded-3xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-primary" />
              <h3 className="font-bold text-foreground">Audio Safety Recording</h3>
              <span className="text-[10px] font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full">Private</span>
            </div>
            <button
              onClick={() => setAudioOn(!audioOn)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                audioOn ? 'border-primary bg-primary/10 text-primary' : 'border-border text-primary hover:bg-primary/5'
              }`}
            >
              {audioOn ? 'Stop' : 'Start'}
            </button>
          </div>

          <div className="bg-gold/5 border border-gold/30 rounded-2xl p-3 mb-4 flex items-start gap-2">
            <Shield size={16} className="text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-gold/90 leading-relaxed">
              Only you can access these recordings. Both parties are aware this feature exists.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <Mic size={16} className={`text-muted-foreground ${audioOn ? '' : 'line-through'}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{audioOn ? 'Recording…' : 'Not recording'}</p>
              <p className="text-xs text-muted-foreground">
                {audioOn ? 'Recording in progress — encrypted' : 'Audio safety is off'}
              </p>
            </div>
            {audioOn && (
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>

        {/* Map placeholder */}
        {locationOn && (
          <div className="bg-card rounded-3xl border border-border p-5">
            <div className="h-48 rounded-2xl bg-secondary flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--secondary))_0%,hsl(var(--card))_100%)]" />
              <div className="relative flex flex-col items-center gap-2">
                <MapPin size={32} className="text-teal" />
                <p className="text-xs text-muted-foreground">Live location sharing active</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">You control your location sharing.</p>
            <button
              onClick={() => setLocationOn(false)}
              className="w-full mt-3 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
            >
              Stop Sharing
            </button>
          </div>
        )}
      </div>
      {showFeedback && (
        <PostDateFeedbackModal
          profile={profile}
          matchId={matchId}
          otherProfile={otherProfile}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}