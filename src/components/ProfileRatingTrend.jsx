import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Heart, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function ProfileRatingTrend({ profile }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!profile) return;
    base44.entities.DateFeedback.filter({ reviewed_id: profile.created_by_id }, '-created_date', 200)
      .then((rows) => {
        const withRatings = rows.filter((f) => typeof f.comfort_rating === 'number' || typeof f.safety_rating === 'number');
        let comfortSum = 0, comfortCount = 0;
        let safetySum = 0, safetyCount = 0;
        const chartData = withRatings
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
          .map((f) => {
            if (typeof f.comfort_rating === 'number') { comfortSum += f.comfort_rating; comfortCount++; }
            if (typeof f.safety_rating === 'number') { safetySum += f.safety_rating; safetyCount++; }
            return {
              date: format(parseISO(f.created_date), 'dd MMM'),
              comfortAvg: comfortCount > 0 ? +(comfortSum / comfortCount).toFixed(2) : null,
              safetyAvg: safetyCount > 0 ? +(safetySum / safetyCount).toFixed(2) : null,
            };
          });
        setData(chartData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-6">
      <div className="h-5 w-40 bg-secondary rounded animate-pulse mb-4" />
      <div className="h-[180px] bg-secondary/50 rounded-xl animate-pulse" />
    </div>
  );

  if (data.length === 0) return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-primary" />
        <h3 className="font-heading font-semibold">Rating trend</h3>
      </div>
      <p className="text-sm text-muted-foreground text-center py-8">
        No feedback received yet. As your matches share ratings, your trend will appear here.
      </p>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          <h3 className="font-heading font-semibold">Rating trend</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Comfort
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" /> Safety
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
            formatter={(value, name) => [value, name === 'comfortAvg' ? 'Comfort avg' : 'Safety avg']}
          />
          <Line type="monotone" dataKey="comfortAvg" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="safetyAvg" stroke="hsl(var(--teal))" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Cumulative average over {data.length} review{data.length === 1 ? '' : 's'} · see full details in Safety Insights
      </p>
    </div>
  );
}