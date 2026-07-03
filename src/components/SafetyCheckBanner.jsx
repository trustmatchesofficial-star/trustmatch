import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, X, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_LABELS = {
  catfishing: 'Catfishing / Fake Identity',
  harassment: 'Harassment / Stalking',
  violence_abuse: 'Violence / Abuse',
  scam_financial: 'Scam / Financial Fraud',
  hidden_relationship: 'Hidden Relationship',
  other: 'Safety Concern',
};

/**
 * Private, non-identifying safety warning shown when a user is about to
 * match or chat with someone whose name matches an approved SafetyAlert.
 * Never exposes the reporter's identity or full alert details.
 */
export default function SafetyCheckBanner({ subjectName }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!subjectName) { setLoading(false); return; }
    base44.entities.SafetyAlert.filter({ status: 'approved' }, '-created_date', 200)
      .then((rows) => {
        const matched = rows.filter(
          (a) => a.subject_full_name && a.subject_full_name.trim().toLowerCase() === subjectName.trim().toLowerCase()
        );
        setAlerts(matched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectName]);

  if (loading || dismissed || alerts.length === 0) return null;

  const categories = [...new Set(alerts.map((a) => a.category))];

  return (
    <div className="bg-gold/10 border border-gold/30 rounded-2xl p-3 mb-3 animate-fade-in">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="text-gold" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            A safety concern has been reported about this person
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proceed with caution. {alerts.length} concern{alerts.length !== 1 ? 's' : ''} reported.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categories.map((c) => (
              <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gold/15 text-gold">
                {CATEGORY_LABELS[c] || c}
              </span>
            ))}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide guidance' : 'Show safety guidance'}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>Meet in a public place and tell a trusted friend where you're going.</li>
              <li>Use the in-app date check-in feature before meeting.</li>
              <li>Trust your instincts — you can end the conversation or block at any time.</li>
              <li>If you feel unsafe, use the SOS button to alert your emergency contact.</li>
            </ul>
          )}
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Reporter identity is confidential. Full details are reviewed by our safety team only.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}