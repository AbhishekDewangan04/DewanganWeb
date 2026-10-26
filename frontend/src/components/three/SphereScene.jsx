import { useEffect, useMemo, useRef } from 'react';
import { ACCENTS } from '@/lib/store';
import { useSearchPhase } from '@/lib/searchSignal';

const TAU = Math.PI * 2;
const PHASE_SPIN = { idle: 0.12, thinking: 0.6, answering: 0.34 };
const PHASE_PULSE = { idle: 0, thinking: 1, answering: 0.55 };
const PHASE_GLOW = { idle: 0.85, thinking: 1.3, answering: 1.05 };

function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function parseHsl(raw) {
  const [h, s, l] = String(raw).trim().split(/\s+/).map(parseFloat);
  return {
    h: Number.isFinite(h) ? h : 188,
    s: Number.isFinite(s) ? s : 86,
    l: Number.isFinite(l) ? l : 53,
  };
}

function hsla({ h, s, l }, alpha) {
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}

/** soft round particle, baked once per accent colour */
function makeSprite({ h, s, l }) {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, hsla({ h, s, l: Math.min(96, l + 14) }, 1));
  grad.addColorStop(0.3, hsla({ h, s, l }, 0.5));
  grad.addColorStop(0.7, hsla({ h, s, l }, 0.12));
  grad.addColorStop(1, hsla({ h, s, l }, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** even shell of points around a unit sphere */
function makePoints(count) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const radius = 1 + (Math.random() - 0.5) * 0.16;
    points.push({
      x: Math.cos(theta) * ring * radius,
      y: y * radius * 0.92,
      z: Math.sin(theta) * ring * radius,
      r: Math.random(),
    });
  }
  return points;
}

/**
 * Ambient particle sphere drawn on a plain 2D canvas: points are rotated in
 * model space and projected by hand, so it keeps its depth without any WebGL.
 */
export default function SphereScene({ accent = 'cyan', count = 2600 }) {
  const canvasRef = useRef(null);
  const phase = useSearchPhase();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const points = useMemo(() => makePoints(count), [count]);

  const palette = useMemo(() => {
    const accentDef = ACCENTS[accent] || ACCENTS.cyan;
    return { a: parseHsl(accentDef.glow1), b: parseHsl(accentDef.glow2) };
  }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const parent = canvas.parentElement || canvas;

    const spriteA = makeSprite(palette.a);
    const spriteB = makeSprite(palette.b);

    let width = 1;
    let height = 1;
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width || window.innerWidth);
      height = Math.max(1, rect.height || window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(parent);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scroll = 0;
    let pulse = 0;
    let yaw = 0.6;
    let pitch = -0.12;
    let roll = 0;
    let elapsed = 0;
    let frames = 0;
    let slow = 0;
    let tuned = false;
    let limit = points.length;

    const onMove = (event) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = -((event.clientY / window.innerHeight - 0.5) * 2);
    };
    const onScroll = () => {
      scroll = Math.min(1.6, window.scrollY / Math.max(1, window.innerHeight));
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (document.hidden) return;

      frames += 1;
      // shed detail once if the device keeps missing the frame budget
      if (!tuned && frames > 24 && frames < 260) {
        slow += dt > 0.026 ? 1 : 0;
        if (slow > 40) {
          tuned = true;
          dpr = 1;
          limit = Math.floor(points.length * 0.55);
          resize();
        }
      }

      const current = phaseRef.current;
      elapsed += dt;
      pointer.x = damp(pointer.x, pointer.tx, 3.2, dt);
      pointer.y = damp(pointer.y, pointer.ty, 3.2, dt);
      pulse = damp(pulse, PHASE_PULSE[current] ?? 0, 3.4, dt);
      const glow = PHASE_GLOW[current] ?? 1;

      yaw += dt * (PHASE_SPIN[current] ?? 0.12);
      pitch = damp(pitch, -pointer.y * 0.34 + Math.sin(elapsed * 0.22) * 0.06, 2.6, dt);
      roll = damp(roll, pointer.x * 0.1, 2.6, dt);

      const radiusScale = (1 - scroll * 0.08) * (1 + pulse * 0.05 + Math.sin(elapsed * 0.7) * 0.012);
      const drift = -scroll * height * 0.16 + pointer.y * height * 0.03;
      const cx = width / 2 + pointer.x * 10;
      const cy = height / 2 + drift;
      const focal = Math.min(width, height) * 1.02;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      const cosZ = Math.cos(roll);
      const sinZ = Math.sin(roll);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.34);
      bloom.addColorStop(0, hsla(palette.a, 0.075 * glow));
      bloom.addColorStop(0.55, hsla(palette.a, 0.022));
      bloom.addColorStop(1, hsla(palette.a, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < limit; i += 1) {
        const point = points[i];
        const px = point.x * radiusScale;
        const py = point.y * radiusScale;
        const pz = point.z * radiusScale;

        const x1 = px * cosY + pz * sinY;
        const z1 = pz * cosY - px * sinY;
        const y1 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        const depth = z2 + 3.2;
        if (depth < 0.5) continue;

        const scale = focal / depth;
        const sx = cx + (x1 * cosZ - y1 * sinZ) * scale;
        const sy = cy - (x1 * sinZ + y1 * cosZ) * scale;
        const size = (1.5 + point.r * 3.4) * (3.2 / depth) * 2.1;

        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

        ctx.globalAlpha = Math.min(1, (0.14 + point.r * 0.36) * glow * (1.32 - depth * 0.1));
        ctx.drawImage(point.r > 0.52 ? spriteA : spriteB, sx - size / 2, sy - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [points, palette]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}