import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Instagram, Facebook, Twitter } from 'lucide-react';

const footerCols = [
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
  { title: 'Support', links: ['Help Center', 'Safety', 'Community', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'] },
];

export default function LandingFooter() {
  return (
    <>
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-primary to-pink-600 px-8 py-14 text-center shadow-2xl shadow-primary/30">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3 text-balance">
            Ready to meet real, verified people?
          </h2>
          <p className="text-white/90 mb-8 max-w-md mx-auto">
            Join Trust Matches today and start connecting with genuine, identity-verified members.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-semibold hover:scale-105 transition shadow-lg"
          >
            Join Free <ArrowRight size={18} />
          </Link>
          <p className="text-white/70 text-sm mt-6">Safe. Secure. Built on trust.</p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Heart className="text-white fill-white" size={16} />
              </div>
              <span className="font-heading font-bold text-slate-900">Trust Matches</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs mb-4">
              The dating app built on trust. Real people, verified identities, safety first.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-slate-900 text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 py-6 px-6 text-center text-sm text-slate-500">
          © 2026 Trust Matches. Built for real connections.
        </div>
      </footer>
    </>
  );
}