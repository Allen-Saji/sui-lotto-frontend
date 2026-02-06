import { TRUST_BADGES } from "@/lib/constants";

export function TrustBadges() {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-4">
        {TRUST_BADGES.map((item, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <span className="text-3xl mb-3 block">{item.icon}</span>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
