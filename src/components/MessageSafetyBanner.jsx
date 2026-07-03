import { useState } from 'react';
import { AlertTriangle, X, Flag } from 'lucide-react';
import ReportModal from './ReportModal';

const PATTERNS = [
  { re: /\b(send|transfer|wire|give)\b[\s\S]{0,40}\b(money|cash|funds?|bitcoin|crypto|gift card|venmo|zelle|paypal)/i, label: 'a request for money' },
  { re: /\b(whatsapp|telegram|snapchat|kik|instagram|facebook|skype|signal)\b[\s\S]{0,40}(@|\b(message|dm|text|add|move|reach|follow|connect)\b)/i, label: 'trying to move you off-platform' },
  { re: /\b(text|call|reach|message)\b[\s\S]{0,30}\b(my |your )?(number|phone|cell|mobile)\b/i, label: 'trying to move you off-platform' },
  { re: /\b(bank|account|routing|sort code|card number|cvv|ssn|national insurance|pin code)\b/i, label: 'asking for financial details' },
  { re: /\b(invest|investment|crypto|trading|guaranteed|double your|forex|profit margin)\b/i, label: 'an investment scheme' },
  { re: /\b(bit\.ly|tinyurl|t\.co|goo\.gl|rb\.gy|cutt\.ly|shorte\.st|is\.gd|buff\.ly)\b/i, label: 'a shortened link' },
  { re: /https?:\/\/[^\s]+?\.(xyz|click|top|work|date|live|stream|club|info|biz|tk|ml|ga|cf)\b/i, label: 'a suspicious link' },
];

export function detectUnsafe(content) {
  if (!content) return null;
  for (const p of PATTERNS) {
    if (p.re.test(content)) return p.label;
  }
  return null;
}

export default function MessageSafetyBanner({ message, otherProfile, myId, onReported }) {
  const [dismissed, setDismissed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const flag = detectUnsafe(message?.content);
  if (!flag || dismissed) return null;

  return (
    <>
      <div className="my-2 flex items-start gap-2 bg-gold/10 border border-gold/30 rounded-2xl p-3 text-sm max-w-[85%]">
        <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" />
        <p className="flex-1 text-gold/90 text-xs leading-relaxed">
          Heads up — this message may involve <span className="font-semibold">{flag}</span>. Stay on-platform, and never
          send money or share financial details.
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setReporting(true)}
            className="flex items-center gap-1 text-gold font-medium text-xs px-2 py-1 rounded-lg hover:bg-gold/20 transition"
          >
            <Flag size={12} /> Report
          </button>
          <button onClick={() => setDismissed(true)} className="text-gold/60 hover:text-gold">
            <X size={14} />
          </button>
        </div>
      </div>
      {reporting && (
        <ReportModal
          reportedProfile={otherProfile}
          reporterId={myId}
          messageId={message?.id}
          onClose={() => setReporting(false)}
          onSubmitted={() => { setReporting(false); onReported?.(); }}
        />
      )}
    </>
  );
}