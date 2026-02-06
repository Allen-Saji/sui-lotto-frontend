import { BALLS } from "@/lib/constants";

export function FloatingBalls() {
  return (
    <>
      {BALLS.map((b) => (
        <div
          key={b.num}
          className={`lottery-ball ${b.anim} hidden md:flex`}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, ${b.color}88)`,
            animationDelay: b.delay,
            zIndex: 1,
            opacity: 0.7,
          }}
        >
          {b.num}
        </div>
      ))}
    </>
  );
}
