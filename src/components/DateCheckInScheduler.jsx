import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, MapPin, X, Loader2, CheckCircle } from 'lucide-react';

function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function DateCheckInScheduler({ profile, matchId, otherName, onClose, onScheduled }) {
  const [dateAt, setDateAt] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!profile) return null;

  const handleSubmit = async () => {
    if (!checkInTime) return;
    setSubmitting(true);
    try {
      await base44.entities.DateCheckIn.create({
        user_id: profile.created_by_id,
        match_id: matchId || undefined,
        date_at: dateAt ? new Date(dateAt).toISOString() : undefined,
        check_in_time: new Date(checkInTime).toISOString(),
        location_note: locationNote.trim() || undefined,
        status: 'pending',
      });
      setDone(true);
      onScheduled?.();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-teal/15 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="text-teal" size={32} />
            </div>
            <h2 className="text-xl font-heading font-bold mb-2">Check-in scheduled</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We'll remind you to check in at the chosen time. If you don't, we'll alert your emergency contact automatically.
            </p>
            <button onClick={onClose} className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-teal" size={22} />
              <h2 className="text-xl font-heading font-bold">Schedule a check-in</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {otherName ? `For your date with ${otherName}. ` : ''}Pick when we should check you're safe.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Calendar size={14} /> Date &amp; time of the date</label>
                <input
                  type="datetime-local"
                  value={dateAt}
                  onChange={(e) => setDateAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Clock size={14} /> Check in by</label>
                <input
                  type="datetime-local"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">If you haven't checked in by this time, we alert your emergency contact.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><MapPin size={14} /> Where are you meeting? (optional)</label>
                <input
                  type="text"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="e.g. Café on the high street"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none transition text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!checkInTime || submitting}
              className="w-full mt-6 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-teal text-accent-foreground font-semibold text-sm disabled:opacity-40 hover:bg-teal/90 transition"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {submitting ? 'Scheduling...' : 'Schedule check-in'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export { toLocalInputValue };