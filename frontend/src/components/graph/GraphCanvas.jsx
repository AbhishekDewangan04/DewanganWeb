import { useEffect, useMemo, useRef } from 'react';

const TAU = Math.PI * 2;
const CAMERA = 8.4;

function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function radiusOf(node) {
  if (node.kind === 'query') return 9;
  if (node.kind === 'source') return 4.4;
  return 5.6;
}

/**
 * The answer's knowledge network on a plain 2D canvas: node positions are
 * rotated and projected by hand, so it orbits and picks without WebGL.
 */
export default function GraphCanvas({
  graph,
  colors,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  allowedIds,
  animate = true,
}) {
  const canvasRef = useRef(null);
  const viewRef = useRef({ yaw: 0.45, pitch: -0.18 });

  const callbacks = useRef({ onSelect, onHover });
  callbacks.current = { onSelect, onHover };

  const focus = useRef({ selectedId, hoveredId });
  focus.current = { selectedId, hoveredId };

  const palette = useRef(colors);
  palette.current = colors;

  const nodes = useMemo(
    () => (allowedIds ? graph.nodes.filter((node) => allowedIds.has(node.id)) : graph.nodes),
    [graph, allowedIds],
  );
  const visible = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes]);
  const links = useMemo(
    () => graph.links.filter((link) => visible.has(link.source) && visible.has(link.target)),
    [graph, visible],
  );
  const byId = useMemo(() => Object.fromEntries(nodes.map((node) => [node.id, node])), [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const parent = canvas.parentElement || canvas;

    const view = viewRef.current;
    let width = 1;
    let height = 1;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let pick = [];
    let hoveredLocal = null;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width || 320);
      height = Math.max(1, rect.height || 340);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(parent);

    const hitTest = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      let best = null;
      let bestDist = Infinity;
      pick.forEach((entry) => {
        const dist = Math.hypot(entry.x - x, entry.y - y);
        if (dist < Math.max(entry.r, 14) && dist < bestDist) {
          best = entry.id;
          bestDist = dist;
        }
      });
      return best;
    };

    const drag = { active: false, moved: 0, x: 0, y: 0 };

    const onPointerDown = (event) => {
      drag.active = true;
      drag.moved = 0;
      drag.x = event.clientX;
      drag.y = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (drag.active) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        view.yaw += dx * 0.007;
        view.pitch = Math.max(-1.15, Math.min(1.15, view.pitch + dy * 0.006));
        return;
      }
      const next = hitTest(event.clientX, event.clientY);
      if (next !== hoveredLocal) {
        hoveredLocal = next;
        callbacks.current.onHover?.(next);
      }
    };

    const endDrag = () => {
      if (!drag.active) return;
      drag.active = false;
      if (drag.moved < 5) {
        const id = hitTest(drag.x, drag.y);
        callbacks.current.onSelect?.(id);
      }
    };

    const onPointerUp = (event) => {
      endDrag();
      canvas.releasePointerCapture?.(event.pointerId);
    };

    const onPointerLeave = () => {
      drag.active = false;
      if (hoveredLocal !== null) {
        hoveredLocal = null;
        callbacks.current.onHover?.(null);
      }
    };

    const onPointerCancel = () => {
      drag.active = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerCancel);

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (document.hidden) return;

      if (animate && !drag.active) view.yaw += dt * 0.16;

      const { selectedId: selected, hoveredId: hovered } = focus.current;
      const colorsNow = palette.current;
      const focusId = selected || hovered;

      const related = new Set();
      if (focusId) {
        related.add(focusId);
        links.forEach((link) => {
          if (link.source === focusId) related.add(link.target);
          if (link.target === focusId) related.add(link.source);
        });
      }

      const cx = width / 2;
      const cy = height / 2;
      const focal = Math.min(width, height) * 0.92;
      const cosY = Math.cos(view.yaw);
      const sinY = Math.sin(view.yaw);
      const cosX = Math.cos(view.pitch);
      const sinX = Math.sin(view.pitch);

      const projected = new Map();
      nodes.forEach((node) => {
        const [x, y, z] = node.pos;
        const x1 = x * cosY + z * sinY;
        const z1 = z * cosY - x * sinY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const depth = z2 + CAMERA;
        if (depth < 0.6) return;
        const scale = focal / depth;
        projected.set(node.id, { x: cx + x1 * scale, y: cy - y1 * scale, depth, scale });
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // links
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = colorsNow.edge;
      links.forEach((link) => {
        const from = projected.get(link.source);
        const to = projected.get(link.target);
        if (!from || !to) return;
        const hot = focusId && (link.source === focusId || link.target === focusId);
        const dim = related.size > 0 && !hot;
        ctx.globalAlpha = hot ? 0.55 : dim ? 0.05 : 0.13;
        ctx.lineWidth = hot ? 1.3 : 0.85;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });

      // nodes, far to near
      pick = [];
      const ordered = nodes
        .map((node) => ({ node, at: projected.get(node.id) }))
        .filter((entry) => entry.at)
        .sort((a, b) => b.at.depth - a.at.depth);

      ctx.globalCompositeOperation = 'lighter';
      ordered.forEach(({ node, at }) => {
        const color = colorsNow[node.kind] || colorsNow.source;
        const isFocus = node.id === focusId;
        const isSelected = node.id === selected;
        const dim = related.size > 0 && !related.has(node.id);
        const size = radiusOf(node) * (isSelected ? 1.5 : isFocus ? 1.28 : 1) * (at.scale / (focal / CAMERA));
        const alpha = dim ? 0.14 : 1;

        ctx.fillStyle = color;
        [
          [3.2, 0.1],
          [2, 0.16],
          [1, 0.9],
        ].forEach(([mult, base]) => {
          ctx.globalAlpha = base * alpha;
          ctx.beginPath();
          ctx.arc(at.x, at.y, Math.max(1, size * mult), 0, TAU);
          ctx.fill();
        });

        pick.push({ id: node.id, x: at.x, y: at.y, r: size });
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [nodes, links, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
    />
  );
}