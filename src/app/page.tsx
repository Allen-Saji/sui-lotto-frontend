import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PrizePool } from "@/components/PrizePool";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BuyTicket } from "@/components/BuyTicket";
import { WinnerTiers } from "@/components/WinnerTiers";
import { HowItWorks } from "@/components/HowItWorks";
import { RecentWinners } from "@/components/RecentWinners";
import { TrustBadges } from "@/components/TrustBadges";
import { Footer } from "@/components/Footer";
import { FloatingBalls } from "@/components/FloatingBalls";

export default function Home() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #06060F 0%, #0a0e1a 40%, #0d0820 70%, #06060F 100%)" }}
    >
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 600, height: 600, top: -200, left: -200, background: "radial-gradient(circle, rgba(77,162,255,0.12), transparent 70%)" }} />
      <div className="bg-orb delay-2000" style={{ width: 500, height: 500, top: "30%", right: -150, background: "radial-gradient(circle, rgba(123,47,190,0.10), transparent 70%)" }} />
      <div className="bg-orb delay-3000" style={{ width: 400, height: 400, bottom: "10%", left: "20%", background: "radial-gradient(circle, rgba(255,45,120,0.08), transparent 70%)" }} />

      <FloatingBalls />
      <Header />
      <HeroSection />
      <PrizePool />

      {/* Countdown + Buy side-by-side */}
      <section id="buy" className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <CountdownTimer />
          <BuyTicket />
        </div>
      </section>

      <WinnerTiers />
      <HowItWorks />
      <RecentWinners />
      <TrustBadges />
      <Footer />
    </div>
  );
}
