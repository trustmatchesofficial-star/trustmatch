import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Siren, Loader2, X, ShieldAlert, Phone, MapPin } from 'lucide-react';

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

export default function PanicButton({ profile, variant = 'full' }) {
  const [armed, setArmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!profile) return null;

  const trigger = async () => {
    setSending(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      const res = await base44.functions.invoke('triggerPanic', {
        user_id: profile.created_by_id,
        location,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again or call 999 if in immediate danger.');
    }
    setSending(false);
  };

  const reset = () => { setArmed(false); setDone(false); setResult(null); setError(null); };

  return (
    <>
      <button
        onClick={() => setArmed(true)}
        className={
          variant === 'fab'
            ? 'fixed bottom-24 right-5 z-30 w-12 h-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/30 hover:scale-105 transition'
            : 'w-full flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-4 rounded-2xl font-bold text-base hover:bg-destructive/90 transition shadow-lg shadow-destructive/20'
        }
        title="Panic / SOS"
      >
        <Siren size={variant === 'fab' ? 22 : 20} />
        {variant !== 'fab' && ' Panic / SOS'}
      </button>

      {armed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6" onClick={reset}>
          <div className="relative w-full max-w-sm bg-card border border-destructive/40 rounded-3xl p-6 animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={reset} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>

            {done ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
                  <ShieldAlert className="text-teal" size={32} />
                </div>
                <h2 className="text-xl font-heading font-bold mb-2">Safety alert sent</h2>
                <p className="text-muted-foreground text-sm mb-2">
                  We've alerted your emergency contact and our safety team.
                </p>
                {result?.locationShared && (
                  <p className="flex items-center justify-center gap-1.5 text-teal text-xs font-medium mb-3">
                    <MapPin size={13} /> Live location shared with your contact
                  </p>
                )}
                {result?.showSos && (
                  <p className="flex items-center justify-center gap-1.5 text-destructive text-sm font-medium mb-5">
                    <Phone size={14} /> If in immediate danger, call 999 now.
                  </p>
                )}
                <button onClick={reset} className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mb-4 mx-auto">
                  <Siren className="text-destructive" size={32} />
                </div>
                <h2 className="text-xl font-heading font-bold text-center mb-2">Trigger safety SOS?</h2>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  This will immediately alert your emergency contact and our safety team with your live location. Only use this in a real safety situation.
                </p>
                <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={13} className="text-primary" />
                  We'll capture your GPS location when you send
                </div>
                {error && (
                  <div className="mb-4 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={reset} className="flex-1 px-5 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={trigger}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-40"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Siren size={16} />}
                    {sending ? 'Sending...' : 'Send SOS'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}