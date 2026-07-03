import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { q: 'Why do I need to verify my identity?', a: 'Verification ensures every member is real and age-confirmed, so you connect with confidence and avoid fake profiles entirely.' },
  { q: 'What safety features are available?', a: 'Live location sharing, emergency SOS, safety check-ins, an emergency contact, and a safety word — all free, always.' },
  { q: 'Is my data private?', a: 'Yes. Privacy is built into the design. You control who can find you, and your data is GDPR-compliant and never sold.' },
  { q: 'How does matching work?', a: 'Swipe through verified profiles, and when you both like each other, you get a match and can start chatting.' },
  { q: 'Can I block or report someone?', a: 'Absolutely. You can block or report anyone at any time. Blocked users disappear from your feed and can no longer message you.' },
  { q: 'Is Trust Matches free?', a: 'Creating a profile, verification, matching, and all safety features are free. Optional premium plans add extra perks.' },
  { q: 'What does the date safety tracker do?', a: 'It lets you privately share your live location with your match during a date, which you can pause or stop at any moment.' },
  { q: 'Who can see my location?', a: 'Only the people on the date you choose to share with. Location is never shared with anyone else, ever.' },
];

export default function LandingFAQ() {
  return (
    <section id="faq" className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Questions, answered</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(0, 4).map((f, i) => (
              <AccordionItem key={i} value={`a-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(4).map((f, i) => (
              <AccordionItem key={i} value={`b-${i}`}>
                <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}