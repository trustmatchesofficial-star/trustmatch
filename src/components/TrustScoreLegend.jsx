import { Shield } from 'lucide-react';

const TIERS = [
  { range: '90–100', label: 'Verified', desc: 'Identity confirmed with ID document and selfie check.', color: 'text-teal', bg: 'bg-teal/15', dot: 'bg-teal' },
  { range: '70–89', label: 'Likely Real', desc: 'Profile looks genuine, but identity not fully verified.', color: 'text-teal', bg: 'bg-teal/10', dot: 'bg-teal/80' },
  { range: '40–69', label: 'Use Caution', desc: 'Limited verification signals. Take extra care.', color: 'text-gold', bg: 'bg-gold/15', dot: 'bg-gold' },
  { range: '0–39', label: 'High Risk', desc: 'Few or no verification signals. Proceed only with caution.', color: 'text-destructive', bg: 'bg-destructive/15', dot: 'bg-destructive' },
];

export default function TrustScoreLegend({ showDisclaimer = true }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trust Score Scale</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {TIERS.map((t) => (
          <div key={t.label} className={`rounded-xl border border-border p-3 flex items-start gap-3 ${t.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${t.dot} mt-1.5 shrink-0`} />
            <div>
              <p className={`text-sm font-bold ${t.color}`}>{t.range} · {t.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {showDisclaimer && (
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground/80">Disclaimer:</strong> Trust Score is a risk assessment based on available signals — it is not a guarantee of someone's identity, character, or safety. Always use your own judgment and follow our safety guidelines when meeting someone new.
          </p>
        </div>
      )}
    </div>
  );
}