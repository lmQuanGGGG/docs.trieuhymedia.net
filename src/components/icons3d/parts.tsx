import type { ReactElement } from "react";
import { block, circle, face, paper, roundRect, solid, tone, type Pt, type Tones } from "./geometry";

/** Tờ giấy có góc gấp, đùn mỏng. */
export function sheet(x: number, y: number, w: number, h: number, fold: number, base: string, depth = 3): ReactElement {
  const p = paper(base);
  const body: Pt[] = [
    [x, y],
    [x + w - fold, y],
    [x + w, y + fold],
    [x + w, y + h],
    [x, y + h],
  ];
  const flap: Pt[] = [
    [x + w - fold, y],
    [x + w - fold, y + fold],
    [x + w, y + fold],
  ];
  return (
    <g>
      {block(body, depth, p, { edge: true })}
      {face(flap, p, { edge: true }, p.side)}
    </g>
  );
}

/** Các dòng chữ giả trên giấy. */
export function lines(x: number, ys: readonly number[], widths: readonly number[], base: string, h = 1.9): ReactElement {
  const fill = tone(base, 0.6);
  return (
    <g>
      {ys.map((y, i) => (
        <rect key={i} x={x} y={y} width={widths[i % widths.length]} height={h} rx={h / 2} fill={fill} />
      ))}
    </g>
  );
}

/** Huy hiệu tròn dạng đồng xu. */
export function badge(cx: number, cy: number, r: number, base: string, depth = 3): ReactElement {
  return block(circle(cx, cy, r), depth, solid(base));
}

/** Thanh bo tròn đùn (dùng cho trục cuộn, thanh ngang). */
export function bar(x: number, y: number, w: number, h: number, t: Tones, depth: number, edge = false): ReactElement {
  return block(roundRect(x, y, w, h, Math.min(h / 2, 2.2)), depth, t, { edge });
}
