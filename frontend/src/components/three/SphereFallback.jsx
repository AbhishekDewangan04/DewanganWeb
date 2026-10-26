export default function SphereFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
      <div className="relative aspect-square w-[46vmin] animate-float">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_36%_30%,hsl(var(--glow-1)/0.45),transparent_62%)] blur-2xl" />
        <div className="absolute inset-[10%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,hsl(var(--glow-1)/0.22),transparent_70%)] blur-lg" />
        <div className="absolute inset-[24%] rounded-full border border-white/15" />
        <div className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--glow-1)/0.55),transparent_72%)] blur-md" />
        <div className="absolute inset-[4%] rounded-full border border-white/[0.06]" />
      </div>
    </div>
  );
}