import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ShieldAlert, X, Loader2, Search, Check, AlertTriangle, MessageCircle,
} from 'lucide-react';

const CATEGORY_LABELS = {
  catfishing: 'Catfishing / Fake Identity',
  harassment: 'Harassment / Stalking',
  violence_abuse: 'Violence / Abuse',
  scam_financial: 'Scam / Financial Fraud',
  hidden_relationship: 'Hidden Relationship',
  other: 'Safety Concern',
};

export default function SafetyAlertDispute({ userId, onClose }) {
  const [searchName, setSearchName] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [disputing, setDisputing] = useState(null);
  const [disputeNote, setDisputeNote] = useState('');
  const [disputedIds, setDisputedIds] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    setSearching(true);
    setError('');
    setSearched(false);
    try {
      const rows = await base44.entities.SafetyAlert.filter({ status: 'approved' }, '-created_date', 200);
      const matched = rows.filter(
        (a) => a.subject_full_name && a.subject_full_name.trim().toLowerCase() === searchName.trim().toLowerCase()
      );
      setResults(matched);
    } catch (err) {
      console.error(err);
      setError('Search failed. Please try again.');
    }
    setSearching(false);
    setSearched(true);
  };

  const handleDispute = async (alert) => {
    if (disputeNote.trim().length < 10) {
      setError('Please provide a brief explanation (10+ characters) of why this is inaccurate.');
      return;
    }
    setDisputing(alert.id);
    setError('');
    try {
      await base44.entities.SafetyAlert.update(alert.id, {
        dispute_status: 'disputed',
        dispute_note: disputeNote.trim(),
        disputed_by_id: userId,
        disputed_at: new Date().toISOString(),
        status: 'pending_review',
      });
      setDisputedIds((ids) => [...ids, alert.id]);
      setDisputeNote('');
    } catch (err) {
      console.error(err);
      setError('Failed to submit dispute. Please try again.');
    }
    setDisputing(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 animate-slide-up shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition z-10"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="text-gold" size={24} />
          <h2 className="text-xl font-heading font-bold">Dispute a Safety Alert</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          If you believe a safety alert was filed about you and is inaccurate, you can dispute it here. Your dispute will be reviewed by our safety team for re-evaluation.
        </p>

        {/* Search */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-1.5 block">Enter your full name to find alerts</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Your full name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchName.trim() || searching}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-40"
            >
              {searching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3 mb-4">
            <AlertTriangle size={14} className="text-destructive shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {searched && results.length === 0 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mb-3 mx-auto">
              <Check className="text-teal" size={28} />
            </div>
            <p className="text-sm text-muted-foreground">No approved safety alerts found for "{searchName}".</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((alert) => (
              <div key={alert.id} className="bg-background border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gold/15 text-gold">
                    {CATEGORY_LABELS[alert.category] || alert.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Reported {new Date(alert.created_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-3">{alert.details}</p>

                {disputedIds.includes(alert.id) ? (
                  <div className="flex items-center gap-2 bg-teal/10 rounded-xl p-3">
                    <Check className="text-teal" size={16} />
                    <p className="text-xs text-teal font-medium">
                      Dispute submitted. Our safety team will re-review this alert.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2 mb-2">
                      <MessageCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <textarea
                        value={disputeNote}
                        onChange={(e) => setDisputeNote(e.target.value)}
                        placeholder="Explain why this alert is inaccurate. Be factual and specific."
                        rows={3}
                        className="flex-1 px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={() => handleDispute(alert)}
                      disabled={disputing === alert.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gold/15 text-gold font-semibold text-sm hover:bg-gold/25 transition disabled:opacity-40"
                    >
                      {disputing === alert.id ? <Loader2 className="animate-spin" size={14} /> : <ShieldAlert size={14} />}
                      {disputing === alert.id ? 'Submitting...' : 'This is about me and it\'s inaccurate'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-5 text-center leading-relaxed">
          Disputes are reviewed by our safety team. Approved alerts remain visible during re-review unless determined to be inaccurate.
        </p>
      </div>
    </div>
  );
}