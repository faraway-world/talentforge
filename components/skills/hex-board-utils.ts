// components/skills/hex-board-utils.ts

export const HEX_SIZE = 60; // Distance from center to any corner

export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE; // ~103.92
export const HEX_HEIGHT = 2 * HEX_SIZE; // 120

export interface HexCoord {
  q: number; // axial column
  r: number; // axial row
}

export interface PixelCoord {
  x: number;
  y: number;
}

// Convert axial coordinates to pixel coordinates for center of hex
// We use a flat-topped or pointy-topped? 
// clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%) is POINTY-TOPPED.
export function axialToPixel(q: number, r: number): PixelCoord {
  const x = HEX_SIZE * Math.sqrt(3) * (q + r / 2);
  const y = HEX_SIZE * (3 / 2) * r;
  return { x, y };
}

export function pixelToAxial(x: number, y: number): HexCoord {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / HEX_SIZE;
  const r = (2 / 3 * y) / HEX_SIZE;
  return hexRound(q, r);
}

export function hexRound(q: number, r: number): HexCoord {
  let s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);

  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
}

// Generate a grid of hexes within a given radius based on (0,0)
export function generateHexGrid(radius: number): HexCoord[] {
  const hexes: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }
  return hexes;
}

export function hexLerp(a: HexCoord, b: HexCoord, t: number): {q: number, r: number, s: number} {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: as + (bs - as) * t
  };
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const as = -a.q - a.r;
  const bs = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(as - bs));
}

export function generateHexEdgePath(start: HexCoord, end: HexCoord): string {
  const N = hexDistance(start, end);
  if (N === 0) return '';
  let pathStr = '';
  const nudge = { q: start.q + 1e-6, r: start.r + 1e-6 };
  
  for (let step = 0; step <= N; step++) {
     const t = N === 0 ? 0.0 : step / N;
     const mapped = hexLerp(nudge, end, t);
     const rounded = hexRound(mapped.q, mapped.r);
     const pix = axialToPixel(rounded.q, rounded.r);
     if (step === 0) {
       pathStr += `M ${pix.x} ${pix.y} `;
     } else {
       pathStr += `L ${pix.x} ${pix.y} `;
     }
  }
  return pathStr;
}
