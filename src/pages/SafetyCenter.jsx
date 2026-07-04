import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Shield, Phone, Mail, MessageSquareWarning, Calendar, Clock, MapPin, Check, Send,
  Siren, ChevronRight, User, AlertTriangle, CheckCircle, Loader2, ShieldAlert, Users,
} from 'lucide-react';
import PanicButton from '@/components/PanicButton';
import DateCheckInScheduler from '@/components/DateCheckInScheduler';
import SafetyAlertForm from '@/components/SafetyAlertForm';
import SafetyAlertDispute from '@/components/SafetyAlertDispute';
import TrustScoreLegend from '@/components/TrustScoreLegend';

const ESCALATION_MODES = [
  { value: 'notify_contact', label: 'Notify my emergency contact', desc: 'We email your contact and our safety team.' },
  { value: 'show_999', label: 'Show 999 guidance', desc: 'We show emergency call guidance and alert admins.' },
  { value: 'both', label: 'Both', desc: 'Notify your contact and show emergency guidance.' },
];

const CHECKLIST = [
  'Share your date plans (time, place) with a trusted contact',
  'Meet in a public, well-lit place for the first date',
  'Keep your phone charged and with you',
  'Tell a friend who you are meeting and where',
  'Arrange your own transport to and from the date',
];

export default function SafetyCenter() {
  const { profile } = useOutletContext();
  const [settings, setSettings] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchProfiles, setMatchProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [checklist, setChecklist] = useState(CHECKLIST.map(() => false));
  const [shareMatch, setShareMatch] = useState(null);
  const [shareSent, setShareSent] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showDispute, setShowDispute] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const results = await base44.entities.SafetySetting.filter({ created_by_id: profile.created_by_id });
        if (results[0]) setSettings(results[0]);
        else {
          const created = await base44.entities.SafetySetting.create({
            escalation_mode: 'notify_contact',
            audio_safety_enabled: false,
            username: profile.full_name?.toLowerCase().replace(/\s+/g, ''),
          });
          setSettings(created);
        }
        const cis = await base44.entities.DateCheckIn.filter({ user_id: profile.created_by_id });
        setCheckIns(cis.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time)));
        const allMatches = await base44.entities.Match.list('-created_date', 50);
        const mine = allMatches.filter((m) => m.status === 'active' && (m.user_a === profile.created_by_id || m.user_b === profile.created_by_id));
        setMatches(mine);
        const ids = [...new Set(mine.map((m) => (m.user_a === profile.created_by_id ? m.user_b : m.user_a)))];
        const map = {};
        await Promise.all(ids.map(async (id) => { try { map[id] = await base44.entities.Profile.get(id); } catch {} }));
        setMatchProfiles(map);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [profile]);

  const update = async (field, value) => {
    if (!settings) return;
    setSettings((s) => ({ ...s, [field]: value }));
    setSavingField(field);
    try {
      await base44.entities.SafetySetting.update(settings.id, { [field]: value });
    } catch (err) { console.error(err); }
    setSavingField(null);
  };

  const handleCheckIn = async (ci) => {
    try {
      await base44.entities.DateCheckIn.update(ci.id, { status: 'checked_in', checked_in_at: new Date().toISOString() });
      setCheckIns((list) => list.map((c) => (c.id === ci.id ? { ...c, status: 'checked_in' } : c)));
    } catch (err) { console.error(err); }
  };

  const sendChecklist = async () => {
    if (!shareMatch) return;
    try {
      const match = matches.find((m) => m.id === shareMatch);
      const otherId = match.user_a === profile.created_by_id ? match.user_b : match.user_a;
      const body = CHECKLIST.map((c, i) => `${i + 1}. ${c}`).join('\n');
      await base44.entities.Message.create({
        match_id: shareMatch,
        sender_id: profile.created_by_id,
        receiver_id: otherId,
        content: `Before we meet, here's my safety checklist:\n${body}\n\nSent via Trust Matches Safety Center.`,
      });
      setShareSent(true);
      setTimeout(() => { setShareSent(false); setShareMatch(null); }, 2000);
    } catch (err) { console.error(err); }
  };

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  const upcoming = checkIns.filter((c) => c.status === 'pending');

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-teal" size={26} />
          <div>
            <h1 className="text-2xl font-heading font-bold">Safety Center</h1>
            <p className="text-xs text-muted-foreground">Tools to keep you safe, before, during, and after a date.</p>
          </div>
        </div>

        {/* Trust Score legend */}
        <div className="mb-6">
          <TrustScoreLegend />
        </div>

        {/* Emergency contact */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emergency contact</h2>
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <input
                type="text"
                value={settings.emergency_contact_name || ''}
                onChange={(e) => setSettings((s) => ({ ...s, emergency_contact_name: e.target.value }))}
                onBlur={(e) => update('emergency_contact_name', e.target.value)}
                placeholder="Contact name"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-muted-foreground" />
              <input
                type="tel"
                value={settings.emergency_contact_phone || ''}
                onChange={(e) => setSettings((s) => ({ ...s, emergency_contact_phone: e.target.value }))}
                onBlur={(e) => update('emergency_contact_phone', e.target.value)}
                placeholder="Phone number"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <input
                type="email"
                value={settings.emergency_contact_email || ''}
                onChange={(e) => setSettings((s) => ({ ...s, emergency_contact_email: e.target.value }))}
                onBlur={(e) => update('emergency_contact_email', e.target.value)}
                placeholder="Email (used for automatic alerts)"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">We'll use these to alert your contact if you miss a check-in or trigger SOS.</p>
          </div>
        </div>

        {/* Escalation mode */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">If I need help</h2>
          <div className="space-y-2">
            {ESCALATION_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => update('escalation_mode', m.value)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition ${
                  settings.escalation_mode === m.value ? 'border-teal bg-teal/10' : 'border-border bg-card hover:border-muted-foreground/40'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${settings.escalation_mode === m.value ? 'border-teal bg-teal' : 'border-muted-foreground/40'}`}>
                  {settings.escalation_mode === m.value && <Check size={12} className="text-accent-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety word + audio */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Extra protection</h2>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="p-4">
              <label className="text-sm font-medium block mb-1.5">Safety word</label>
              <input
                type="text"
                value={settings.safety_word || ''}
                onChange={(e) => setSettings((s) => ({ ...s, safety_word: e.target.value }))}
                onBlur={(e) => update('safety_word', e.target.value)}
                placeholder="A word you can use to signal you need discreet help"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm"
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <span className="text-sm">Automatic audio safety recording</span>
                <p className="text-xs text-muted-foreground mt-0.5">Record audio during dates (encrypted, you control it)</p>
              </div>
              <button
                onClick={() => update('audio_safety_enabled', !settings.audio_safety_enabled)}
                className={`w-10 h-5 rounded-full relative transition ${settings.audio_safety_enabled ? 'bg-teal' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.audio_safety_enabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Before you meet checklist */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Before you meet</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="space-y-2.5 mb-4">
              {CHECKLIST.map((item, i) => (
                <button key={i} onClick={() => setChecklist((c) => c.map((v, idx) => (idx === i ? !v : v)))} className="w-full flex items-start gap-3 text-left">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${checklist[i] ? 'bg-teal border-teal' : 'border-border'}`}>
                    {checklist[i] && <Check size={12} className="text-accent-foreground" />}
                  </div>
                  <span className={`text-sm ${checklist[i] ? 'text-muted-foreground line-through' : ''}`}>{item}</span>
                </button>
              ))}
            </div>
            {matches.length > 0 ? (
              shareMatch ? (
                <div className="space-y-2">
                  <select
                    value={shareMatch}
                    onChange={(e) => setShareMatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none text-sm"
                  >
                    {matches.map((m) => {
                      const otherId = m.user_a === profile.created_by_id ? m.user_b : m.user_a;
                      const p = matchProfiles[otherId];
                      return <option key={m.id} value={m.id}>{p?.full_name || 'Match'}</option>;
                    })}
                  </select>
                  <button onClick={sendChecklist} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-teal text-accent-foreground font-semibold text-sm hover:bg-teal/90 transition">
                    {shareSent ? <><CheckCircle size={16} /> Sent!</> : <><Send size={16} /> Send checklist to match</>}
                  </button>
                </div>
              ) : (
                <button onClick={() => setShareMatch(matches[0]?.id)} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-teal/40 text-teal font-semibold text-sm hover:bg-teal/5 transition">
                  <Send size={16} /> Send this checklist to a match
                </button>
              )
            ) : (
              <p className="text-xs text-muted-foreground">Match someone first to share your checklist with them.</p>
            )}
          </div>
        </div>

        {/* Date check-ins */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date check-ins</h2>
            <button onClick={() => setShowScheduler(true)} className="flex items-center gap-1.5 text-sm font-medium text-teal hover:text-teal/80">
              <Calendar size={16} /> Schedule
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-6 text-center">
              <Clock className="text-muted-foreground mx-auto mb-2" size={28} />
              <p className="text-sm text-muted-foreground">No upcoming check-ins. Schedule one before your next date.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((ci) => {
                const otherId = matches.find((m) => m.id === ci.match_id) ? (matches.find((m) => m.id === ci.match_id).user_a === profile.created_by_id ? matches.find((m) => m.id === ci.match_id).user_b : matches.find((m) => m.id === ci.match_id).user_a) : null;
                const other = otherId ? matchProfiles[otherId] : null;
                return (
                  <div key={ci.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center shrink-0">
                      <Clock className="text-teal" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {other ? `Date with ${other.full_name}` : 'Date check-in'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Check in by {new Date(ci.check_in_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        {ci.location_note && <span className="flex items-center gap-0.5"><MapPin size={10} /> {ci.location_note}</span>}
                      </p>
                    </div>
                    <button onClick={() => handleCheckIn(ci)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal/15 text-teal text-sm font-medium hover:bg-teal/25 transition">
                      <Check size={14} /> I'm safe
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Community Safety Alerts */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Community Safety Alerts</h2>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <ShieldAlert className="text-gold" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Report a safety concern about someone</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Warn others about concerning behavior you've experienced. All reports are human-reviewed before going live — nothing is publicly searchable. Safety concerns reported about your matches will show as private warnings before you connect.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowAlertForm(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gold/15 text-gold font-semibold text-sm hover:bg-gold/25 transition"
              >
                <ShieldAlert size={16} /> Submit a Safety Alert
              </button>
              <button
                onClick={() => setShowDispute(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-border text-muted-foreground font-medium text-xs hover:text-foreground transition"
              >
                <Users size={14} /> Dispute an alert about me
              </button>
            </div>
          </div>
        </div>

        {/* Panic */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emergency</h2>
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Press the button below if you ever feel unsafe. We'll immediately alert your emergency contact and our safety team.
              </p>
            </div>
            <PanicButton profile={profile} />
          </div>
        </div>

        {savingField && <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving...</p>}
      </div>

      {showScheduler && (
        <DateCheckInScheduler
          profile={profile}
          onClose={() => setShowScheduler(false)}
          onScheduled={async () => {
            const cis = await base44.entities.DateCheckIn.filter({ user_id: profile.created_by_id });
            setCheckIns(cis.sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time)));
          }}
        />
      )}

      {showAlertForm && (
        <SafetyAlertForm
          reporterId={profile.created_by_id}
          onClose={() => setShowAlertForm(false)}
        />
      )}

      {showDispute && (
        <SafetyAlertDispute
          userId={profile.created_by_id}
          onClose={() => setShowDispute(false)}
        />
      )}
    </div>
  );
}