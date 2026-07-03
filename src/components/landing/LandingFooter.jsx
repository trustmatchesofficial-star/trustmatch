import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Heart, Instagram, Facebook, Twitter } from 'lucide-react';

const footerCols = [
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
  { title: 'Support', links: ['Help Center', 'Safety', 'Community', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'] },
];

export default function LandingFooter() {
  return (
    <>
      {/* Magenta CTA bar */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-primary px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-primary/20">
          <div className="flex items-center gap-2.5 text-primary-foreground">
            <ShieldCheck size={24} />
            <span className="font-semibold text-sm md:text-base">Your safety. Your trust. Your match.</span>
          </div>
          <div className="flex items-center gap-3 text-primary-foreground">
            <span className="text-sm hidden sm:inline">Join the future of dating.</span>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 bg-primary-foreground text-primary px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition shadow-lg"
            >
              Join Trust Matches. <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

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
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">{l}</a>
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
    </>
  );
}