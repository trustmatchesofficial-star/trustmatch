import { useState } from 'react';
import { Lightbulb, Shield } from 'lucide-react';

const SUGGESTIONS = ['Purple Lantern', 'I forgot my red umbrella', 'My cat needs feeding'];
const ESCALATION_OPTIONS = [
  { value: 'notify_contact', label: 'Notify my emergency contact only' },
  { value: 'show_999', label: 'Show call 999 button' },
  { value: 'both', label: 'Both — notify contact & show 999' },
];

export default function SafetyWordModal({ otherName, onSave, onClose }) {
  const [phrase, setPhrase] = useState('');
  const [escalation, setEscalation] = useState('notify_contact');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-card rounded-3xl border border-border max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Safety Word</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition">
            ✕
          </button>
        </div>

        <span className="inline-flex items-center gap-1 bg-teal/15 text-teal px-2.5 py-0.5 rounded-full text-xs font-medium mb-4">
          <Shield size={12} /> Pre-date setup
        </span>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Choose a phrase that sounds natural in conversation. If you say it during your date, we'll discreetly alert you and optionally your emergency contact.
        </p>

        {/* Suggestions */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-gold" />
            <span className="text-sm font-medium text-foreground">Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPhrase(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  phrase === s
                    ? 'border-teal bg-teal/10 text-teal'
                    : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Or type your own phrase</label>
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Purple Lantern"
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition text-sm"
          />
        </div>

        {/* Escalation */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-3">If I don't respond, escalate by:</p>
          <div className="space-y-2">
            {ESCALATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEscalation(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition text-left ${
                  escalation === opt.value
                    ? 'border-teal bg-teal/5 text-foreground'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                  escalation === opt.value ? 'border-teal bg-teal' : 'border-muted-foreground'
                }`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave({ phrase, escalation })}
          disabled={!phrase.trim()}
          className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition"
        >
          Save safety word
        </button>
      </div>
    </div>
  );
}