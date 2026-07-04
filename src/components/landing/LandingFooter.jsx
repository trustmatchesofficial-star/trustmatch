import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';

const footerCols = [
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'How It Works', to: '/#how' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Safety Center', to: '/safety-center' },
      { label: 'How Verification Works', to: '/#how-verification-works' },
      { label: 'Date Safety', to: '/#safety' },
      { label: 'Join Free', to: '/register' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log In', to: '/login' },
      { label: 'Sign Up', to: '/register' },
      { label: 'Forgot Password', to: '/forgot-password' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="text-primary-foreground fill-primary-foreground" size={16} />
            </div>
            <span className="font-heading font-bold text-foreground">Trust Matches</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            The dating app built on trust. Real people, verified identities, safety first.
          </p>
          <div className="flex gap-3">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-foreground text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 px-6 text-center text-sm text-muted-foreground">
        © 2026 Trust Matches. Built for real connections.
      </div>
    </footer>
  );
}