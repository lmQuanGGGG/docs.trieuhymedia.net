import type { ReactElement } from "react";

/* Bộ dựng hình 2.5D "clay-flat": chiếu xiên, chiều sâu lùi lên trên-phải.
   Ánh sáng từ trên-trái: mặt trên sáng nhất, mặt trước tông gốc, mặt bên tối nhất.
   Chỉ dùng màu đặc, không gradient / hiệu ứng mờ. */

export type Pt = readonly [number, number];

/** Hướng chiều sâu (trên mỗi đơn vị depth). */
export const DEPTH: Pt = [0.74, -0.6];

const FALLBACK = "#71717A";

function parseHex(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return parseHex(FALLBACK);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** Trộn màu trong sRGB: amount > 0 về trắng, amount < 0 về đen. Trả về hex. */
export function tone(hex: string, amount: number): string {
  const t = Math.min(1, Math.abs(amount));
  const target = amount >= 0 ? 255 : 0;
  return (
    "#" +
    parseHex(hex)
      .map((c) => Math.round(c + (target - c) * t).toString(16).padStart(2, "0"))
      .join("")
  );
}

export interface Tones {
  top: string;
  front: string;
  side: string;
  edge: string;
}

/** Vật liệu đặc: tông gốc. */
export function solid(base: string): Tones {
  return { top: tone(base, 0.3), front: base, side: tone(base, -0.26), edge: tone(base, -0.4) };
}

/** Vật liệu nhạt (phần phụ). */
export function soft(base: string): Tones {
  return { top: tone(base, 0.74), front: tone(base, 0.58), side: tone(base, 0.4), edge: tone(base, 0.2) };
}

/** Giấy: trắng ngả theo tông gốc. */
export function paper(base: string): Tones {
  return { top: tone(base, 0.97), front: tone(base, 0.91), side: tone(base, 0.72), edge: tone(base, 0.5) };
}

/* ---------- Đa giác cơ bản ---------- */

const r2 = (n: number) => Math.round(n * 100) / 100;

export function pathOf(...polys: readonly (readonly Pt[])[]): string {
  return polys
    .map((p) => "M" + p.map(([x, y]) => `${r2(x)} ${r2(y)}`).join("L") + "Z")
    .join("");
}

export function shift(pts: readonly Pt[], dx: number, dy: number): Pt[] {
  return pts.map(([x, y]) => [x + dx, y + dy] as const);
}

/** Dời theo chiều sâu. */
export function back(pts: readonly Pt[], depth: number): Pt[] {
  return shift(pts, DEPTH[0] * depth, DEPTH[1] * depth);
}

export function rotate(pts: readonly Pt[], cx: number, cy: number, deg: number): Pt[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as const);
}

export function rect(x: number, y: number, w: number, h: number): Pt[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, seg: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = ((from + ((to - from) * i) / seg) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

/** Hình chữ nhật bo góc; r có thể là [tl, tr, br, bl]. */
export function roundRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | readonly [number, number, number, number],
): Pt[] {
  const [tl, tr, br, bl] = typeof r === "number" ? [r, r, r, r] : r;
  const corner = (cx: number, cy: number, rad: number, from: number): Pt[] =>
    rad > 0 ? arc(cx, cy, rad, rad, from, from + 90, 6) : [[cx, cy]];
  return [
    ...corner(x + tl, y + tl, tl, 180),
    ...corner(x + w - tr, y + tr, tr, 270),
    ...corner(x + w - br, y + h - br, br, 0),
    ...corner(x + bl, y + h - bl, bl, 90),
  ];
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, n = 48): Pt[] {
  return arc(cx, cy, rx, ry, 0, 360, n).slice(0, n);
}

export function circle(cx: number, cy: number, r: number, n = 48): Pt[] {
  return ellipse(cx, cy, r, r, n);
}

/** Viên nang (hai đầu tròn) theo trục góc deg. */
export function capsule(cx: number, cy: number, len: number, width: number, deg: number): Pt[] {
  const r = width / 2;
  const half = len / 2 - r;
  const pts: Pt[] = [...arc(cx + half, cy, r, r, -90, 90, 12), ...arc(cx - half, cy, r, r, 90, 270, 12)];
  return rotate(pts, cx, cy, deg);
}

/** Đa giác theo trục cục bộ (u dọc trục, v ngang trục) quay quanh gốc o. */
export function along(o: Pt, deg: number, local: readonly Pt[]): Pt[] {
  return rotate(
    local.map(([u, v]) => [o[0] + u, o[1] + v] as const),
    o[0],
    o[1],
    deg,
  );
}

/** Đa giác ngôi sao. */
export function starShape(cx: number, cy: number, outer: number, inner: number, points = 5): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((-90 + (i * 180) / points) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

function area(pts: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

/** Chuẩn hoá chiều kim đồng hồ (trên màn hình, trục y hướng xuống). */
function clockwise(pts: readonly Pt[]): Pt[] {
  return area(pts) < 0 ? [...pts].reverse() : [...pts];
}

/** Cắt đa giác lồi subject bởi đa giác lồi clip (Sutherland–Hodgman). */
export function intersect(subject: readonly Pt[], clipPoly: readonly Pt[]): Pt[] {
  const c = clockwise(clipPoly);
  let out: Pt[] = clockwise(subject);
  for (let i = 0; i < c.length && out.length > 0; i++) {
    const a = c[i];
    const b = c[(i + 1) % c.length];
    const inside = (p: Pt) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= 0;
    const cross = (p: Pt, q: Pt): Pt => {
      const a1 = b[1] - a[1];
      const b1 = a[0] - b[0];
      const c1 = a1 * a[0] + b1 * a[1];
      const a2 = q[1] - p[1];
      const b2 = p[0] - q[0];
      const c2 = a2 * p[0] + b2 * p[1];
      const det = a1 * b2 - a2 * b1;
      return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det];
    };
    const input = out;
    out = [];
    for (let j = 0; j < input.length; j++) {
      const p = input[j];
      const q = input[(j + 1) % input.length];
      if (inside(q)) {
        if (!inside(p)) out.push(cross(p, q));
        out.push(q);
      } else if (inside(p)) {
        out.push(cross(p, q));
      }
    }
  }
  return out;
}

/* ---------- Khối đùn ---------- */

type Facet = "top" | "side";

interface Strip {
  pts: Pt[];
  facet: Facet;
  order: number;
}

/**
 * Tính các dải mặt bên nhìn thấy khi đùn đa giác theo DEPTH.
 * inward = true: thành trong của lỗ (pháp tuyến hướng vào tâm lỗ).
 */
function strips(raw: readonly Pt[], depth: number, inward: boolean): Strip[] {
  const pts = clockwise(raw);
  const n = pts.length;
  const [dx, dy] = DEPTH;
  const sign = inward ? -1 : 1;
  const cls: (Facet | null)[] = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const ex = b[0] - a[0];
    const ey = b[1] - a[1];
    const len = Math.hypot(ex, ey) || 1;
    const nx = (sign * ey) / len;
    const ny = (sign * -ex) / len;
    if (nx * dx + ny * dy <= 0.02) return null;
    return ny < -0.38 ? "top" : "side";
  });
  // Bắt đầu tại cạnh đổi loại để gom dải liền mạch
  let start = cls.findIndex((c, i) => c !== cls[(i - 1 + n) % n]);
  if (start < 0) {
    if (cls[0] === null) return [];
    start = 0;
  }
  const out: Strip[] = [];
  let i = 0;
  while (i < n) {
    const k = (start + i) % n;
    const facet = cls[k];
    let run = 1;
    while (i + run < n && cls[(start + i + run) % n] === facet) run++;
    if (facet) {
      const front: Pt[] = [];
      for (let j = 0; j <= run; j++) front.push(pts[(k + j) % n]);
      const rear = back(front, depth).reverse();
      const mid = front[Math.floor(front.length / 2)];
      out.push({ pts: [...front, ...rear], facet, order: mid[0] * dx + mid[1] * dy });
    }
    i += run;
  }
  return out.sort((a, b) => a.order - b.order);
}

interface Style {
  /** Viền mảnh cùng tông (dùng cho giấy). */
  edge?: boolean;
}

function edgeProps(t: Tones, s?: Style) {
  return s?.edge
    ? { stroke: t.edge, strokeWidth: 0.7, strokeLinejoin: "round" as const }
    : { stroke: "none" };
}

function Strips({ list, t, s }: { list: Strip[]; t: Tones; s?: Style }) {
  return (
    <>
      {list.map((st, i) => (
        <path
          key={i}
          d={pathOf(st.pts)}
          fill={st.facet === "top" ? t.top : t.side}
          // Viền cùng màu che khe khử răng cưa giữa các dải
          {...(s?.edge ? edgeProps(t, s) : { stroke: st.facet === "top" ? t.top : t.side, strokeWidth: 0.25 })}
        />
      ))}
    </>
  );
}

/** Phần thân phía sau (mặt trên + mặt bên) của khối đùn. */
export function blockSides(pts: readonly Pt[], depth: number, t: Tones, s?: Style): ReactElement {
  return <Strips list={strips(pts, depth, false)} t={t} s={s} />;
}

/** Mặt trước phẳng. */
export function face(pts: readonly Pt[], t: Tones, s?: Style, fill?: string): ReactElement {
  return <path d={pathOf(pts)} fill={fill ?? t.front} {...edgeProps(t, s)} />;
}

/** Khối đùn hoàn chỉnh. */
export function block(pts: readonly Pt[], depth: number, t: Tones, s?: Style): ReactElement {
  return (
    <g>
      {blockSides(pts, depth, t, s)}
      {face(pts, t, s)}
    </g>
  );
}

/**
 * Khối có lỗ (vòng, mắt xích, mặt đồng hồ lõm).
 * holeDepth < depth + glass: lỗ là hốc nông có đáy màu glass.
 */
export function ring(
  outer: readonly Pt[],
  inner: readonly Pt[],
  depth: number,
  t: Tones,
  opts: Style & { holeDepth?: number; glass?: string } = {},
): ReactElement {
  const hd = opts.holeDepth ?? depth;
  return (
    <g>
      {blockSides(outer, depth, t, opts)}
      {opts.glass ? <path d={pathOf(back(inner, hd))} fill={opts.glass} /> : null}
      <Strips list={strips(inner, hd, true)} t={t} />
      <path d={pathOf(clockwise(outer), clockwise(inner))} fillRule="evenodd" fill={t.front} {...edgeProps(t, opts)} />
    </g>
  );
}

/** Khối cầu phẳng hai tông: phần khuất sáng ở dưới-phải. */
export function sphere(cx: number, cy: number, r: number, t: Tones): ReactElement {
  const c = circle(cx, cy, r, 40);
  const lit = intersect(c, circle(cx - r * 0.22, cy - r * 0.22, r, 40));
  return (
    <g>
      <path d={pathOf(c)} fill={t.side} />
      <path d={pathOf(lit)} fill={t.front} />
    </g>
  );
}

/** Bóng đổ phẳng dưới vật, theo currentColor để hợp cả nền sáng lẫn tối. */
export function Ground({ cx = 33, cy = 57, rx = 20, ry = 2.8 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="currentColor" opacity={0.1} />;
}
