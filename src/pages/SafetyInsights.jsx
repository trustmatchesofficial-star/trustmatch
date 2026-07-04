import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Shield, TrendingUp, CheckCircle2, Calendar, Activity, ArrowLeft, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function SafetyInsights() {
  const { profile } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [feedbackReceived, setFeedbackReceived] = useState([]);
  const [feedbackGiven, setFeedbackGiven] = useState([]);
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const userId = profile.created_by_id;
    Promise.all([
      base44.entities.DateFeedback.filter({ reviewed_id: userId }, '-created_date', 200),
      base44.entities.DateFeedback.filter({ reviewer_id: userId }, '-created_date', 200),
      base44.entities.DateCheckIn.filter({ user_id: userId }, '-created_date', 200),
    ])
      .then(([received, given, ci]) => {
        setFeedbackReceived(received);
        setFeedbackGiven(given);
        setCheckIns(ci);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
    </div>
  );

  // --- Compute stats ---
  const receivedRatings = feedbackReceived.filter((f) => typeof f.comfort_rating === 'number');
  const avgComfort = receivedRatings.length > 0
    ? receivedRatings.reduce((a, f) => a + f.comfort_rating, 0) / receivedRatings.length
    : 0;
  const avgSafety = receivedRatings.length > 0
    ? receivedRatings.filter((f) => typeof f.safety_rating === 'number')
        .reduce((a, f) => a + f.safety_rating, 0) / (receivedRatings.filter((f) => typeof f.safety_rating === 'number').length || 1)
    : 0;

  const safeCheckIns = checkIns.filter((c) => c.status === 'checked_in');
  const missedCheckIns = checkIns.filter((c) => c.status === 'missed' || c.status === 'escalated');

  // Build trend data for comfort rating over time (received feedback, chronological)
  const trendData = [...receivedRatings]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map((f, i) => ({
      idx: i + 1,
      date: format(parseISO(f.created_date), 'dd MMM'),
      comfort: f.comfort_rating,
      safety: f.safety_rating || null,
    }));

  // Check-in history (last 10)
  const checkInHistory = checkIns.slice(0, 10).map((c) => ({
    date: c.check_in_time ? format(parseISO(c.check_in_time), 'dd MMM HH:mm') : '—',
    status: c.status,
    location: c.location_note || 'Not specified',
  }));

  // Check-in status distribution for bar chart
  const checkInStats = [
    { name: 'Safe', count: safeCheckIns.length },
    { name: 'Missed', count: missedCheckIns.length },
  ];

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/safety-hub" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4">
          <ArrowLeft size={16} /> Safety Hub
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal/15 flex items-center justify-center">
            <Activity className="text-teal" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Safety Insights</h1>
            <p className="text-sm text-muted-foreground">Your safety trends at a glance</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-card rounded-2xl border border-border p-4">
            <Star className="text-gold mb-2" size={18} />
            <p className="text-2xl font-heading font-bold">{avgComfort > 0 ? avgComfort.toFixed(1) : '—'}</p>
            <p className="text-xs text-muted-foreground">Avg comfort (out of 5)</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <Shield className="text-teal mb-2" size={18} />
            <p className="text-2xl font-heading font-bold">{avgSafety > 0 ? avgSafety.toFixed(1) : '—'}</p>
            <p className="text-xs text-muted-foreground">Avg safety (out of 5)</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <CheckCircle2 className="text-teal mb-2" size={18} />
            <p className="text-2xl font-heading font-bold">{safeCheckIns.length}</p>
            <p className="text-xs text-muted-foreground">Safe check-ins</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <Calendar className="text-primary mb-2" size={18} />
            <p className="text-2xl font-heading font-bold">{checkIns.length}</p>
            <p className="text-xs text-muted-foreground">Total check-ins</p>
          </div>
        </div>

        {/* Comfort trend chart */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-heading font-semibold">Comfort rating trend</h2>
          </div>
          {trendData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No date feedback received yet. After dates, your matches can leave private feedback that appears here.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="comfort" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Comfort" />
                <Line type="monotone" dataKey="safety" stroke="hsl(var(--teal))" strokeWidth={2} dot={{ r: 3 }} name="Safety" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Check-in summary bar chart */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-teal" />
            <h2 className="font-heading font-semibold">Check-in summary</h2>
          </div>
          {checkIns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No safety check-ins yet. Set up a check-in before your next date from the Date Safety screen.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={checkInStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(var(--teal))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Check-in history */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-heading font-semibold mb-4">Recent check-ins</h2>
          {checkInHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No check-in history yet.</p>
          ) : (
            <div className="space-y-2">
              {checkInHistory.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.date}</p>
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    c.status === 'checked_in' ? 'bg-teal/15 text-teal' :
                    c.status === 'pending' ? 'bg-gold/15 text-gold' :
                    'bg-destructive/15 text-destructive'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}