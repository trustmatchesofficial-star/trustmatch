import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Compass, User, Shield, MessageCircle, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'tm_guided_walkthrough_done';

const STEPS = [
  {
    icon: Heart,
    title: 'Welcome to Trust Matches',
    description: 'A safety-first dating platform. Let\u2019s take a quick tour so you get the most out of your experience.',
    accent: 'text-primary',
    bg: 'bg-primary/15',
    action: null,
  },
  {
    icon: Compass,
    title: 'Discover People',
    description: 'Swipe right to like, left to pass. Use the search bar and filters to find people nearby who share your interests.',
    accent: 'text-primary',
    bg: 'bg-primary/15',
    action: { label: 'Go to Discover', path: '/discover' },
  },
  {
    icon: User,
    title: 'Complete Your Profile',
    description: 'Add more photos, write a bio, and pick your interests \u2014 complete profiles get up to 10\u00d7 more matches.',
    accent: 'text-accent',
    bg: 'bg-accent/15',
    action: { label: 'Edit Profile', path: '/profile' },
  },
  {
    icon: Shield,
    title: 'Your Safety Hub',
    description: 'Set up identity verification, emergency contacts, and a safety word. Enable Date Safety Mode for live location sharing on dates.',
    accent: 'text-teal',
    bg: 'bg-teal/15',
    action: { label: 'Open Safety Hub', path: '/safety-hub' },
  },
  {
    icon: MessageCircle,
    title: 'Chat Safely',
    description: 'When you match, start chatting. Every chat has a safety shield for quick access to emergency tools if you need them.',
    accent: 'text-purple-custom',
    bg: 'bg-purple/15',
    action: { label: 'View Messages', path: '/messages' },
  },
  {
    icon: Check,
    title: 'You\u2019re All Set!',
    description: 'You\u2019re ready to start matching. Remember \u2014 your safety always comes first at Trust Matches.',
    accent: 'text-gold',
    bg: 'bg-gold/15',
    action: null,
  },
];

export default function GuidedWalkthrough() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    setVisible(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const handleAction = () => {
    const action = STEPS[step].action;
    if (action) {
      finish();
      navigate(action.path);
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-6">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 animate-slide-up shadow-2xl">
        {/* Close */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition"
        >
          <X size={18} />
        </button>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8 mt-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl ${current.bg} flex items-center justify-center mb-6 mx-auto`}>
          <Icon className={current.accent} size={40} strokeWidth={2} />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-heading font-bold text-center mb-3">{current.title}</h2>
        <p className="text-muted-foreground text-center text-sm leading-relaxed mb-8">{current.description}</p>

        {/* Actions */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-input font-medium hover:bg-secondary transition text-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {current.action ? (
            <button
              onClick={handleAction}
              className={`flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition`}
            >
              {current.action.label} <ArrowRight size={16} />
            </button>
          ) : step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="flex-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition"
            >
              Get Started <Check size={16} />
            </button>
          )}
        </div>

        {/* Skip link */}
        {step < STEPS.length - 1 && (
          <button
            onClick={finish}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition mt-4"
          >
            Skip walkthrough
          </button>
        )}
      </div>
    </div>
  );
}