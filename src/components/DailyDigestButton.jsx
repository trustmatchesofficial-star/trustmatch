import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Send, Loader2, CheckCircle, Inbox } from 'lucide-react';

export default function DailyDigestButton({ profile }) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const handleSend = async () => {
    if (!profile || !user?.email) return;
    setSending(true);
    setSent(false);
    try {
      const likes = await base44.entities.Like.filter({ liker_id: profile.created_by_id });
      const likedIds = likes.map((l) => l.liked_id);

      const myBlocks = await base44.entities.Block.filter({ blocker_id: profile.created_by_id });
      const blockedByMe = myBlocks.map((b) => b.blocked_id);
      const blockedMe = await base44.entities.Block.filter({ blocked_id: profile.id });
      const blockedMeUserIds = blockedMe.map((b) => b.blocker_id);

      const all = await base44.entities.Profile.list('-created_date', 200);
      let candidates = all.filter(
        (p) =>
          p.id !== profile.id &&
          !likedIds.includes(p.id) &&
          !blockedByMe.includes(p.id) &&
          !blockedMeUserIds.includes(p.created_by_id) &&
          p.is_active &&
          p.is_onboarded &&
          p.age >= (profile.age_pref_min || 18) &&
          p.age <= (profile.age_pref_max || 99)
      );

      candidates.sort((a, b) => {
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });

      const topMatches = candidates.slice(0, 5);
      setMatchCount(topMatches.length);

      if (topMatches.length === 0) {
        setSent(true);
        return;
      }

      const matchCards = topMatches
        .map(
          (m) => `
          <div style="background:#f5f5f5;border-radius:12px;padding:14px 16px;margin:10px 0;">
            <div style="font-weight:600;font-size:15px;color:#222;">${m.full_name}, ${m.age} ${m.is_verified ? "\u2713" : ""}</div>
            <div style="font-size:13px;color:#888;margin-top:2px;">${m.location || "Nearby"}${m.bio ? " \u2014 " + m.bio.substring(0, 80) + (m.bio.length > 80 ? "..." : "") : ""}</div>
          </div>`
        )
        .join("");

      const body = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;">
  <h2 style="color:#f0568b;margin:0 0 4px;font-size:22px;">Your Daily Matches</h2>
  <p style="color:#999;font-size:13px;margin:0 0 20px;">${topMatches.length} new people to discover today</p>
  <p style="font-size:15px;color:#333;">Hi ${profile.full_name},</p>
  <p style="font-size:14px;color:#888;">We found some great potential matches for you:</p>
  ${matchCards}
  <p style="font-size:14px;color:#555;margin-top:24px;">Open Trust Matches to see full profiles and start connecting!</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:12px;color:#aaa;">You're receiving this because you enabled daily match digests.</p>
</div>`;

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your Daily Matches \u2014 ${topMatches.length} new people to discover!`,
        body,
        from_name: "Trust Matches",
      });

      setSent(true);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-teal/10 text-teal text-sm">
        <CheckCircle size={16} />
        {matchCount > 0
          ? `Digest sent! ${matchCount} ${matchCount === 1 ? "match" : "matches"} emailed to ${user?.email}`
          : "No new matches found right now — check back later!"}
      </div>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-40"
    >
      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      {sending ? "Finding your matches..." : "Send me today's matches"}
      {!sending && <Inbox size={14} className="opacity-60 ml-1" />}
    </button>
  );
}