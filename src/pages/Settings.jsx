import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, Eye, Download, Trash2, BadgeCheck, ChevronRight, Lock, User, Mail, Video, LogOut } from 'lucide-react';
import VerificationModal from '@/components/VerificationModal';
import LiveVideoVerification from '@/components/LiveVideoVerification';
import DailyDigestButton from '@/components/DailyDigestButton';

export default function Settings() {
  const { profile, setProfile } = useOutletContext();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSent, setExportSent] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const results = await base44.entities.SafetySetting.filter({ created_by_id: profile.created_by_id });
        if (results[0]) {
          setSettings(results[0]);
        } else {
          const created = await base44.entities.SafetySetting.create({
            show_distance: true,
            read_receipts: true,
            findable_by: 'everyone',
            verified_only: false,
            audio_safety_enabled: false,
            escalation_mode: 'notify_contact',
            daily_digest_enabled: false,
            username: profile.full_name?.toLowerCase().replace(/\s+/g, ''),
          });
          setSettings(created);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [profile]);

  const update = async (field, value) => {
    if (!settings) return;
    setSettings((s) => ({ ...s, [field]: value }));
    setSaving(true);
    try {
      await base44.entities.SafetySetting.update(settings.id, { [field]: value });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading || !settings) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-heading font-bold mb-6">Settings</h1>

        {/* Privacy */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm">Show distance on profile</span>
              <button
                onClick={() => update('show_distance', !settings.show_distance)}
                className={`w-10 h-5 rounded-full relative transition ${settings.show_distance ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.show_distance ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <span className="text-sm">Read receipts</span>
                {!profile?.is_premium && (
                  <span className="ml-2 inline-flex items-center gap-1 bg-gold/20 text-gold text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
              </div>
              <button
                onClick={() => profile?.is_premium && update('read_receipts', !settings.read_receipts)}
                className={`w-10 h-5 rounded-full relative transition ${settings.read_receipts ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.read_receipts ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm">Who can find me by name</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground capitalize">
                {settings.findable_by?.replace('_', ' ')}
                <ChevronRight size={16} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm">Show only verified profiles</span>
              <button
                onClick={() => update('verified_only', !settings.verified_only)}
                className={`w-10 h-5 rounded-full relative transition ${settings.verified_only ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.verified_only ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div>
                <span className="text-sm">Daily match digest</span>
                <p className="text-xs text-muted-foreground mt-0.5">Get a daily email with your top potential matches</p>
              </div>
              <button
                onClick={() => update('daily_digest_enabled', !settings.daily_digest_enabled)}
                className={`w-10 h-5 rounded-full relative transition ${settings.daily_digest_enabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings.daily_digest_enabled ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
            {settings.daily_digest_enabled && (
              <div className="px-4 pb-4">
                <DailyDigestButton profile={profile} />
                <p className="text-xs text-muted-foreground mt-2">
                  We'll find your top 5 potential matches and email them to you instantly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Safety & Verification */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety & Verification</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <Link to="/safety-center" className="w-full flex items-center justify-between p-4 hover:bg-teal/5 transition">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-teal" />
                <span className="text-sm font-medium text-teal">Open Safety Center</span>
              </div>
              <ChevronRight size={16} className="text-teal" />
            </Link>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm">Identity verification status</span>
              <span className={`text-sm font-medium flex items-center gap-1 ${profile?.is_verified ? 'text-teal' : 'text-muted-foreground'}`}>
                {profile?.is_verified && <BadgeCheck size={16} />}
                {profile?.is_verified ? 'Verified' : 'Not verified'}
              </span>
            </div>
            <button onClick={() => setShowLive(true)} className="w-full flex items-center justify-between p-4 hover:bg-purplecustom/5 transition">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-purplecustom" />
                <span className="text-sm font-medium text-purplecustom">Live video verification</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm">
                {profile?.is_live_verified
                  ? <><BadgeCheck size={16} className="text-purplecustom" /> <span className="text-purplecustom">Verified</span></>
                  : <ChevronRight size={16} className="text-muted-foreground" />}
              </span>
            </button>
            {!profile?.is_verified && (
              <button
                onClick={() => setShowVerify(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-teal/5 transition border-t border-border"
              >
                <span className="text-sm font-medium text-teal">Get verified now</span>
                <ChevronRight size={16} className="text-teal" />
              </button>
            )}
            <div className="p-4">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Username</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-background rounded-xl border border-input px-4 py-2.5">
                  <span className="text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    value={settings.username || ''}
                    onChange={(e) => setSettings((s) => ({ ...s, username: e.target.value }))}
                    className="bg-transparent outline-none text-sm flex-1 ml-1"
                  />
                </div>
                <button
                  onClick={() => update('username', settings.username)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm">Trust check requested</span>
              <BadgeCheck size={18} className="text-teal" />
            </div>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition">
              <span className="text-sm">Re-verify identity</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition">
              <span className="text-sm">Community Guidelines</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Safety banner */}
        <div className="bg-card rounded-2xl border border-teal/30 p-4 mb-6">
          <h3 className="font-semibold text-teal text-sm mb-1">Safety features are always free</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reporting, blocking, profile verification, Date Safety Mode, emergency contacts, safety check-ins, safety phrases, and emergency support are free for every user — no subscription needed.
          </p>
        </div>

        {/* GDPR Rights */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={16} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your GDPR Rights</h2>
          </div>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <button
              onClick={async () => {
                setExporting(true);
                setExportSent(false);
                try {
                  await base44.functions.invoke('exportMyData', {});
                  setExportSent(true);
                } catch (err) {
                  console.error(err);
                }
                setExporting(false);
              }}
              disabled={exporting}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Download size={16} className="text-muted-foreground" />
                <span className="text-sm">
                  {exporting ? 'Sending...' : exportSent ? 'Data sent to your email ✓' : 'Email me my data'}
                </span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition">
              <div className="flex items-center gap-2">
                <Trash2 size={16} className="text-destructive" />
                <span className="text-sm text-destructive">Request account deletion</span>
              </div>
              <ChevronRight size={16} className="text-destructive" />
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="mb-6">
          <button
            onClick={() => base44.auth.logout('/')}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:bg-destructive/5 transition"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} className="text-destructive" />
              <span className="text-sm font-medium text-destructive">Sign out</span>
            </div>
            <ChevronRight size={16} className="text-destructive" />
          </button>
        </div>

        {saving && <p className="text-center text-xs text-muted-foreground">Saving...</p>}
      </div>

      {showVerify && (
        <VerificationModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowVerify(false)}
        />
      )}
      {showLive && (
        <LiveVideoVerification
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowLive(false)}
        />
      )}
    </div>
  );
}