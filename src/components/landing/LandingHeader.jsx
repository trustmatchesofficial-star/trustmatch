import { Link } from 'react-router-dom';
import { Heart, ShieldCheck } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Safety', href: '#safety' },
  { label: 'How It Works', href: '#how' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Heart className="text-primary-foreground fill-primary-foreground" size={16} />
          </div>
          <span className="font-heading font-bold text-foreground">Trust Matches</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition">
            Log In
          </Link>
          <Link to="/register" className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition shadow-sm">
            <ShieldCheck size={15} /> Join Free
          </Link>
        </div>
      </div>
    </header>
  );
}