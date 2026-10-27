import HeroSphere from '@/components/three/HeroSphere';

export default function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#04080c]" />

      <div className="absolute -top-[26rem] left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--glow-1)/0.22),transparent_62%)] blur-3xl" />
      <div
        className="absolute -left-40 top-1/4 h-[38rem] w-[38rem] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--glow-2)/0.2),transparent_65%)] blur-3xl"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute -right-32 bottom-[-12rem] h-[40rem] w-[40rem] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--dew-emerald)/0.16),transparent_66%)] blur-3xl"
        style={{ animationDelay: '-12s' }}
      />

      <HeroSphere />

      <div className="grid-veil absolute inset-0 opacity-40 [mask-image:radial-gradient(85%_55%_at_50%_0%,black,transparent)]" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
    </div>
  );
}