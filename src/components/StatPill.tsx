export function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        background: accent ? "rgba(57, 255, 20, 0.06)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${accent ? "rgba(57, 255, 20, 0.2)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <span className="text-xs text-white/40 font-mono">{label}</span>
      <span className={`font-bold font-mono text-sm ${accent ? "text-[#39FF14]" : "text-white"}`}>{value}</span>
    </div>
  );
}
