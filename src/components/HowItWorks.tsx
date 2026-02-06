import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section id="how" className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          How It <span className="bg-gradient-to-r from-[#39FF14] to-[#4DA2FF] bg-clip-text text-transparent">Works</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-4 gap-6 relative">
        {/* Connector line (desktop) */}
        <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px]"
          style={{ background: "linear-gradient(90deg, #4DA2FF33, #7B2FBE33, #FF2D7833, #39FF1433)" }}
        />

        {HOW_IT_WORKS_STEPS.map((s, i) => (
          <div key={i} className="glass-card p-6 text-center relative">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl relative z-10"
              style={{ background: `${s.color}18`, border: `2px solid ${s.color}44` }}
            >
              {s.icon}
            </div>
            <p className="font-mono text-xs tracking-widest mb-2" style={{ color: `${s.color}88` }}>{s.step}</p>
            <h3 className="font-bold text-lg mb-2">{s.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
