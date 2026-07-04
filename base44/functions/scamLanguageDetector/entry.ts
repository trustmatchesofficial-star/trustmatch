import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Lightweight pattern-based scam language detection.
// Uses weighted regex patterns — no LLM call needed, runs on every message.
// Only notifies the recipient privately. Never notifies the sender,
// never blocks or filters the message, never takes action against the sender.

const SCAM_PATTERNS = [
  // --- Money / financial requests (high weight) ---
  { regex: /gift\s*card/i, weight: 4, label: 'gift card request' },
  { regex: /bitcoin|crypto(currency)?|ethereum|usdt|tether/i, weight: 4, label: 'cryptocurrency mention' },
  { regex: /wire\s*transfer|bank\s*transfer|send\s*(me\s*)?(money|cash|funds)/i, weight: 4, label: 'money transfer request' },
  { regex: /paypal|venmo|cashapp|cash\s*app|zelle|western\s*union|moneygram/i, weight: 3, label: 'payment app mention' },
  { regex: /financial\s*(help|assistance|support)|help\s*me\s*with\s*(money|funds)|can\s*you\s*(send|lend|loan)\s/i, weight: 3, label: 'financial help request' },
  { regex: /medical\s*(bill|expense|cost)|hospital\s*(bill|fee)|surgery|treatment\s*cost/i, weight: 3, label: 'medical expense story' },
  { regex: /stuck\s*at\s*(the\s*)?(airport|hotel|customs)|hotel\s*(bill|fee)|visa\s*fee|customs\s*(fee|charge)/i, weight: 3, label: 'travel emergency story' },
  { regex: /investment|trading\s*platform|forex|binary\s*options|guaranteed\s*return/i, weight: 3, label: 'investment scheme' },

  // --- Off-platform migration (medium weight) ---
  { regex: /\bwhatsapp\b|\btelegram\b|google\s*hangouts|\bkik\b/i, weight: 2, label: 'off-platform messaging app' },
  { regex: /text\s*me\s*(at|on)?|call\s*me\s*(at|on)?|my\s*(phone|number)\s*is|phone\s*number|email\s*me\s*at|dm\s*me\s*on/i, weight: 2, label: 'off-platform contact request' },
  { regex: /move\s*to\s*(another|a\s*different|other)|other\s*app|different\s*app|off\s*(here|this\s*app)/i, weight: 2, label: 'pressure to leave platform' },

  // --- Love bombing (medium weight) ---
  { regex: /never\s*felt\s*this\s*way|soul\s*mate|destiny\s*(brought|brought\s*us)|meant\s*to\s*be\s*(together|with)|found\s*the\s*one/i, weight: 2, label: 'love bombing language' },
  { regex: /marry\s*(you|me)|future\s*(wife|husband|together)|spend\s*forever|love\s*of\s*my\s*life/i, weight: 2, label: 'premature commitment language' },

  // --- Refusal to video / meet (high weight) ---
  { regex: /can'?t\s*(video\s*call|face\s*time|meet\s*up|see\s*you)|no\s*camera|camera'?s?\s*broken|not\s*(able|ready)\s*to\s*(meet|video|call)/i, weight: 3, label: 'refusal to video/meet' },
  { regex: /deployed|oil\s*rig|working\s*on\s*(a\s*)?ship|contractor\s*(abroad|overseas)|peacekeeping|military\s*mission|on\s*a\s*rig/i, weight: 3, label: 'overseas deployment story' },

  // --- Urgency / emergency (high weight) ---
  { regex: /emergency|urgent(ly)?|desperately\s*need|need\s*help\s*(now|urgently|asap|immediately)/i, weight: 3, label: 'urgency language' },
  { regex: /stranded|stuck\s*in|trapped|held\s*(at|by)|detained/i, weight: 3, label: 'stranded story' },
  { regex: /sick\s*(relative|family|mother|mom|father|dad|child|son|daughter|kid)|dying|in\s*the\s*(hospital|icu)/i, weight: 3, label: 'sick relative story' },
  { regex: /package\s*(held|stuck|intercepted)|customs\s*(held|seized)|owing\s*(customs|tax)/i, weight: 2, label: 'package/customs story' },
];

// Only flag if the combined weight meets this threshold.
// A single low-weight pattern won't trigger — multiple signals are needed.
const FLAG_THRESHOLD = 5;

function detectScamPatterns(content) {
  if (!content || typeof content !== 'string') {
    return { flagged: false, score: 0, matches: [] };
  }

  let totalScore = 0;
  const matches = [];
  const seenLabels = new Set();

  for (const p of SCAM_PATTERNS) {
    if (p.regex.test(content)) {
      totalScore += p.weight;
      if (!seenLabels.has(p.label)) {
        matches.push(p.label);
        seenLabels.add(p.label);
      }
    }
  }

  return {
    flagged: totalScore >= FLAG_THRESHOLD,
    score: totalScore,
    matches,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow system (entity automation) or admin calls.
    const isAuthed = await base44.auth.isAuthenticated();
    if (!isAuthed) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let caller = null;
    try { caller = await base44.auth.me(); } catch {}
    if (caller && caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    // Extract message data from the entity automation payload.
    const payload = await req.json();
    const messageData = payload?.data;
    const messageId = payload?.event?.entity_id || messageData?.id;

    let message = messageData;
    if (!message && messageId) {
      message = await svc.entities.Message.get(messageId);
    }
    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only analyse text messages.
    if (message.message_type && message.message_type !== 'text') {
      return Response.json({ ok: true, skipped: true, reason: 'non-text message' });
    }

    const result = detectScamPatterns(message.content);

    if (!result.flagged) {
      return Response.json({ ok: true, flagged: false, score: result.score });
    }

    // Create a private, non-alarming notification for the RECIPIENT ONLY.
    // Never notify the sender. Never block or filter the message.
    await svc.entities.Notification.create({
      user_id: message.receiver_id,
      type: 'system',
      title: 'Heads up',
      body: 'This message has patterns common in scam attempts. Never send money, gift cards, or crypto to someone you haven\u2019t met in person. Be cautious if asked to move off the app. Trust your instincts \u2014 if something feels off, it probably is.',
      match_id: message.match_id || undefined,
      is_read: false,
    });

    return Response.json({
      ok: true,
      flagged: true,
      score: result.score,
      matches: result.matches,
    });
  } catch (error) {
    console.error('scamLanguageDetector error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});