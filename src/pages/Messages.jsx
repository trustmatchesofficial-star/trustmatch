import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Search } from 'lucide-react';
import moment from 'moment';

export default function Messages() {
  const { profile } = useOutletContext();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      try {
        const matches = await base44.entities.Match.list('-last_message_at', 50);
        const mine = matches.filter(
          (m) => m.status === 'active' && (m.user_a === profile.created_by_id || m.user_b === profile.created_by_id)
        );

        const convos = await Promise.all(
          mine.map(async (m) => {
            const otherId = m.user_a === profile.created_by_id ? m.user_b : m.user_a;
            let otherProfile = null;
            let lastMsg = null;
            try {
              otherProfile = await base44.entities.Profile.get(otherId);
            } catch (e) {}
            try {
              const msgs = await base44.entities.Message.filter({ match_id: m.id });
              lastMsg = msgs[msgs.length - 1] || null;
            } catch (e) {}
            return { match: m, profile: otherProfile, lastMsg };
          })
        );
        setConversations(convos.sort((a, b) => {
          const aTime = a.lastMsg?.created_date ? new Date(a.lastMsg.created_date) : new Date(0);
          const bTime = b.lastMsg?.created_date ? new Date(b.lastMsg.created_date) : new Date(0);
          return bTime - aTime;
        }));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [profile]);

  const filtered = conversations.filter((c) =>
    !search || c.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-4">Messages</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-muted-foreground" size={36} />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">Match with someone to start chatting!</p>
            <Link to="/matches" className="inline-flex mt-4 items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition">
              View Matches
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(({ match, profile: p, lastMsg }) => (
              <Link
                key={match.id}
                to={`/chat/${match.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-secondary transition-colors"
              >
                <div className="relative">
                  <img
                    src={p?.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100`}
                    alt={p?.full_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{p?.full_name || 'Unknown'}</h3>
                    {lastMsg?.created_date && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {moment(lastMsg.created_date).fromNow()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMsg ? lastMsg.content : 'Say hello! 👋'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}