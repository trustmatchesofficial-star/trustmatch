import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/MessageBubble';
import MessageSafetyBanner, { detectUnsafe } from '@/components/MessageSafetyBanner';
import PanicButton from '@/components/PanicButton';
import DateCheckInScheduler from '@/components/DateCheckInScheduler';
import PostDateFeedbackModal from '@/components/PostDateFeedbackModal';
import { ArrowLeft, Send, MoreVertical, BadgeCheck, Flag, Ban, Calendar, Star } from 'lucide-react';
import BlockModal from '@/components/BlockModal';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function Chat() {
  const { matchId } = useParams();
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!profile || !matchId) return;
    const load = async () => {
      try {
        const m = await base44.entities.Match.get(matchId);
        setMatch(m);
        const otherId = m.user_a === profile.created_by_id ? m.user_b : m.user_a;
        const p = await base44.entities.Profile.get(otherId);
        setOtherProfile(p);
        const msgs = await base44.entities.Message.filter({ match_id: matchId });
        setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
        const myBlocks = await base44.entities.Block.filter({ blocker_id: profile.created_by_id, blocked_id: p.id });
        const theirBlocks = await base44.entities.Block.filter({ blocker_id: p.created_by_id, blocked_id: profile.id });
        setIsBlockedByMe(myBlocks.length > 0);
        setIsBlockedByThem(theirBlocks.length > 0);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [profile, matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !match || !profile || isBlockedByMe || isBlockedByThem) return;
    const content = input.trim();
    setInput('');
    try {
      const otherId = match.user_a === profile.created_by_id ? match.user_b : match.user_a;
      const msg = await base44.entities.Message.create({
        match_id: matchId,
        sender_id: profile.created_by_id,
        receiver_id: otherId,
        content,
      });
      setMessages((m) => [...m, msg]);
      await base44.entities.Match.update(matchId, { last_message_at: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async () => {
    if (!otherProfile || !profile) return;
    try {
      await base44.entities.Report.create({
        reporter_id: profile.created_by_id,
        reported_id: otherProfile.id,
        reason: 'other',
        details: 'Reported from chat',
        status: 'pending',
      });
      alert('Report submitted. Our team will review it.');
    } catch (err) {
      console.error(err);
    }
    setShowMenu(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="p-2 -ml-2 hover:bg-secondary rounded-full transition">
          <ArrowLeft size={22} />
        </button>
        <img
          src={otherProfile?.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100`}
          alt={otherProfile?.full_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-semibold truncate">{otherProfile?.full_name}</h2>
            {otherProfile?.is_verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-xs text-green-500">Active now</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-secondary rounded-full transition">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 w-44 z-30">
              <button onClick={() => { setShowCheckIn(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-teal hover:bg-secondary transition">
                <Calendar size={16} /> Schedule check-in
              </button>
              <button onClick={() => { setShowFeedback(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gold hover:bg-secondary transition">
                <Star size={16} /> Leave date feedback
              </button>
              <button onClick={handleReport} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition">
                <Flag size={16} /> Report User
              </button>
              <button onClick={() => { setBlockTarget(otherProfile); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-secondary transition">
                <Ban size={16} /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.sender_id === profile?.created_by_id;
            return (
              <div key={msg.id}>
                <MessageBubble message={msg} isMine={mine} />
                {!mine && detectUnsafe(msg.content) && (
                  <MessageSafetyBanner message={msg} otherProfile={otherProfile} myId={profile?.created_by_id} />
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-lg border-t border-border px-4 py-3 safe-bottom">
        <div className="max-w-2xl mx-auto">
          {isBlockedByMe ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
              <Ban size={16} /> You blocked this user. Unblock to send messages.
            </div>
          ) : isBlockedByThem ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
              <Ban size={16} /> You can no longer message this user.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-full border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      <BlockModal
        blockedProfile={blockTarget}
        blockerId={profile?.created_by_id}
        onClose={() => setBlockTarget(null)}
        onBlocked={() => setIsBlockedByMe(true)}
      />
      <PanicButton profile={profile} variant="fab" />
      {showCheckIn && (
        <DateCheckInScheduler
          profile={profile}
          matchId={matchId}
          otherName={otherProfile?.full_name}
          onClose={() => setShowCheckIn(false)}
        />
      )}
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