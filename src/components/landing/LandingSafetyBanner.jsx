import { Heart } from 'lucide-react';

export default function LandingSafetyBanner() {
  return (
    <section className="py-12 px-6 bg-background">
      <div className="max-w-6xl mx-auto bg-card rounded-3xl border border-border p-8 md:p-12">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4 text-balance">
              Built for real connections. <span className="text-primary">Designed for your safety.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              At Trust Matches, we believe trust starts with feeling safe. The Date Safety Tracker is just one of the many ways we help you connect with confidence.
            </p>
          </div>
          <div className="flex items-center gap-2 justify-start md:justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="text-primary-foreground fill-primary-foreground" size={16} />
            </div>
            <span className="font-heading font-bold text-foreground">Trust Matches</span>
          </div>
        </div>
      </div>
    </section>
  );
}