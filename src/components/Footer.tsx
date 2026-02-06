export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-12">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "linear-gradient(135deg, #4DA2FF, #7B2FBE)" }}
          >
            <span className="text-sm">🎰</span>
          </div>
          <span className="font-bold text-sm">
            <span className="text-[#4DA2FF]">Sui</span>Lotto
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
          <span>Powered by</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4DA2FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[#4DA2FF] font-semibold">Sui Network</span>
        </div>

        <div className="flex items-center gap-4 text-white/30 text-xs">
          <span>Testnet</span>
          <span>•</span>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
