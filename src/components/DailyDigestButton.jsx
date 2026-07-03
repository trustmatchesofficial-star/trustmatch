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

      const matchLines = topMatches
        .map((m, i) => {
          const verified = m.is_verified ? ' ✓' : '';
          const bio = m.bio ? `\n    ${m.bio.substring(0, 80)}${m.bio.length > 80 ? '...' : ''}` : '';
          return `  ${i + 1}. ${m.full_name}, ${m.age}${verified}\n    ${m.location || 'Nearby'}${bio}`;
        })
        .join('\n\n');

      const body =
        `Your Daily Matches\n` +
        `${topMatches.length} new people to discover today\n\n` +
        `Hi ${profile.full_name},\n\n` +
        `We found some great potential matches for you:\n\n` +
        `${matchLines}\n\n` +
        `Open Trust Matches to see full profiles and start connecting!\n\n` +
        `— The Trust Matches Team\n\n` +
        `You're receiving this because you enabled daily match digests.`;

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