import type { ReactElement } from "react";
import { cn } from "@/lib/utils";
import {
  DEPTH,
  Ground,
  along,
  back,
  block,
  blockSides,
  capsule,
  circle,
  ellipse,
  face,
  paper,
  pathOf,
  rect,
  ring,
  roundRect,
  shift,
  soft,
  solid,
  sphere,
  starShape,
  tone,
  type Pt,
} from "./geometry";
import { badge, bar, lines, sheet } from "./parts";

type Draw = (base: string) => ReactElement;

/* ---------- Danh mục ---------- */

const proposals: Draw = (c) => {
  const p = paper(c);
  const s = solid(c);
  const tail = solid(tone(c, -0.12));
  return (
    <>
      <Ground cx={32} rx={19} />
      {sheet(16, 14, 28, 34, 0, c, 3)}
      {lines(20, [21, 25.5, 30], [18, 14, 16], c)}
      {bar(13, 10, 34, 6, p, 4, true)}
      {bar(13, 46, 34, 6, p, 4, true)}
      {block(
        [
          [36, 46],
          [40, 47.5],
          [38.5, 57],
          [36.4, 55],
          [33.6, 56.4],
        ],
        1.5,
        tail,
      )}
      {block(
        [
          [41, 47.5],
          [45, 46],
          [47.4, 56.4],
          [44.6, 55],
          [42.5, 57],
        ],
        1.5,
        tail,
      )}
      {badge(40.5, 44, 7, c, 2.5)}
      <circle cx={40.5} cy={44} r={4.2} fill="none" stroke={s.top} strokeWidth={1} />
    </>
  );
};

const companyProfiles: Draw = (c) => {
  const s = solid(c);
  const annex = solid(tone(c, 0.2));
  const win = tone(c, 0.82);
  const winA = tone(c, 0.86);
  return (
    <>
      <Ground cx={34} rx={21} />
      {block(rect(13, 14, 22, 41), 9, s)}
      {block(rect(35, 30, 15, 25), 9, annex)}
      {[19, 26, 33, 40].map((y) => (
        <g key={y}>
          <rect x={16.5} y={y} width={6} height={4.2} rx={0.8} fill={win} />
          <rect x={25.5} y={y} width={6} height={4.2} rx={0.8} fill={win} />
        </g>
      ))}
      <rect x={20.5} y={47} width={7} height={8} rx={0.8} fill={s.side} />
      {[35, 41, 47].map((y) => (
        <rect key={y} x={38.5} y={y} width={8} height={3.4} rx={0.8} fill={winA} />
      ))}
    </>
  );
};

const quotations: Draw = (c) => {
  const p = paper(c);
  const s = solid(c);
  const teeth = 6;
  const x0 = 13;
  const x1 = 41;
  const step = (x1 - x0) / teeth;
  const zig: Pt[] = [];
  for (let i = 0; i <= teeth * 2; i++) zig.push([x1 - (i * step) / 2, i % 2 === 0 ? 50 : 46.8]);
  const receipt: Pt[] = [[x0, 9], [x1, 9], ...zig];
  return (
    <>
      <Ground cx={33} rx={20} />
      {block(receipt, 3, p, { edge: true })}
      <rect x={17} y={14.5} width={12} height={3} rx={1.5} fill={s.front} />
      {lines(17, [22, 27, 32], [10, 12, 8], c)}
      {lines(31, [22, 27, 32], [6, 6, 6], c)}
      <rect x={17} y={38} width={20} height={1.2} rx={0.6} fill={tone(c, 0.7)} />
      {badge(42, 43, 10, c, 3.5)}
      <circle cx={42} cy={43} r={6.6} fill="none" stroke={s.top} strokeWidth={1.3} />
      <rect x={40.8} y={39.2} width={2.4} height={7.6} rx={1.2} fill={s.top} />
    </>
  );
};

const contracts: Draw = (c) => {
  const s = solid(c);
  const nib = tone(c, 0.62);
  const pen = along([52, 13], 117, [
    [0, -3.6],
    [24, -3.6],
    [32, 0],
    [24, 3.6],
    [0, 3.6],
  ]);
  const tip = along([52, 13], 117, [
    [24, -3.6],
    [32, 0],
    [24, 3.6],
  ]);
  const band = along([52, 13], 117, [
    [10, -3.6],
    [12, -3.6],
    [12, 3.6],
    [10, 3.6],
  ]);
  return (
    <>
      <Ground cx={32} rx={20} />
      {sheet(11, 9, 29, 43, 8, c, 3)}
      {lines(15, [19, 24, 29, 34], [16, 19, 13, 17], c)}
      <path
        d="M15 45c1.6-3.4 3.4-3.6 3.6-.6.2 2.6 1.8 2.4 3.4-.4 1.2-2 2.4-1.8 2.8.2.3 1.4 1.6 1.2 3.2.2"
        fill="none"
        stroke={s.front}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {blockSides(pen, 3, s)}
      {face(pen, s)}
      {face(tip, s, undefined, nib)}
      {face(band, s, undefined, s.top)}
    </>
  );
};

const presentations: Draw = (c) => {
  const p = paper(c);
  const legs = solid(tone(c, -0.18));
  const s = solid(c);
  const sf = soft(c);
  return (
    <>
      <Ground cx={33} rx={21} />
      {block(
        [
          [20.5, 38],
          [24, 38],
          [17, 57],
          [13.5, 57],
        ],
        2,
        legs,
      )}
      {block(
        [
          [40, 38],
          [43.5, 38],
          [50.5, 57],
          [47, 57],
        ],
        2,
        legs,
      )}
      {block(rect(11, 13, 40, 29), 3, p, { edge: true })}
      {bar(9, 9, 44, 4.5, s, 4)}
      <rect x={15.5} y={37} width={31} height={1.2} rx={0.6} fill={tone(c, 0.65)} />
      {block(rect(18, 28, 6, 9), 1.6, sf)}
      {block(rect(27, 23, 6, 14), 1.6, sf)}
      {block(rect(36, 17, 6, 20), 1.6, s)}
    </>
  );
};

const portfolios: Draw = (c) => {
  const s = solid(c);
  const h = solid(tone(c, -0.18));
  const clasp = soft(c);
  const handle: Pt[] = shift(
    [
      [21, 22],
      [21, 15.5],
      [22.4, 12.6],
      [25, 11.5],
      [35, 11.5],
      [37.6, 12.6],
      [39, 15.5],
      [39, 22],
      [35.4, 22],
      [35.4, 16.2],
      [34.6, 15.2],
      [25.4, 15.2],
      [24.6, 16.2],
      [24.6, 22],
    ],
    DEPTH[0] * 3.5 - 1,
    DEPTH[1] * 3.5,
  );
  return (
    <>
      <Ground cx={33} rx={22} />
      {block(handle, 3, h)}
      {block(roundRect(8, 20, 42, 33, 4.5), 7, s)}
      <rect x={8} y={32} width={42} height={2.4} fill={s.side} />
      {block(roundRect(24.5, 29, 9, 8.4, 1.6), 1.5, clasp)}
    </>
  );
};

const brandAssets: Draw = (c) => {
  const p = paper(c);
  const dabs: [number, number, string][] = [
    [19, 32, c],
    [25.5, 23, "#B7791F"],
    [36, 21.5, "#3F6E6A"],
    [18.5, 42.5, "#3B5F8A"],
  ];
  return (
    <>
      <Ground cx={33} rx={22} />
      {ring(ellipse(31, 35, 22.5, 18, 56), ellipse(40, 42, 4.2, 3.6, 28), 3.5, p, { edge: true })}
      {dabs.map(([x, y, col]) => (
        <g key={`${x}-${y}`}>{block(circle(x, y, 4.3, 28), 1.8, solid(col))}</g>
      ))}
      {block(
        along([50, 12], 125, [
          [0, -1.8],
          [20, -1.4],
          [20, 1.4],
          [0, 1.8],
        ]),
        2,
        solid(tone(c, -0.25)),
      )}
      {block(
        along([50, 12], 125, [
          [19, -2.2],
          [26, -2.4],
          [30, 0],
          [26, 2.4],
          [19, 2.2],
        ]),
        2,
        solid(c),
      )}
    </>
  );
};

/* ---------- Thao tác ---------- */

const docNew: Draw = (c) => {
  const plus = paper(c).top;
  return (
    <>
      <Ground cx={32} rx={19} />
      {sheet(12, 8, 30, 44, 8, c, 3)}
      {lines(16, [18, 23, 28, 33], [14, 18, 12, 9], c)}
      {badge(43, 44, 10, c, 3)}
      <rect x={38.2} y={42.7} width={9.6} height={2.6} rx={1.3} fill={plus} />
      <rect x={41.7} y={39.2} width={2.6} height={9.6} rx={1.3} fill={plus} />
    </>
  );
};

const upload: Draw = (c) => {
  const tray = soft(c);
  const s = solid(c);
  const x0 = 8;
  const x1 = 48;
  const y = 38;
  const dep = 12;
  const [dx, dy] = DEPTH;
  const at = (x: number, z: number): Pt => [x + dx * z, y + dy * z];
  const front = roundRect(x0, y, x1 - x0, 14, [0, 0, 2.5, 2.5]);
  const opening: Pt[] = [at(x0 + 3, 2.5), at(x1 - 3, 2.5), at(x1 - 3, dep - 2), at(x0 + 3, dep - 2)];
  const rim: Pt[] = [at(x0, 0), at(x1, 0), at(x1, 2.5), at(x0, 2.5)];
  const arrow = back(
    [
      [24, 44],
      [24, 25],
      [16.5, 25],
      [28, 11],
      [39.5, 25],
      [32, 25],
      [32, 44],
    ],
    5,
  );
  return (
    <>
      <Ground cx={34} rx={22} />
      {blockSides(front, dep, tray)}
      <path d={pathOf(opening)} fill={tray.edge} />
      {block(arrow, 3, s)}
      <path d={pathOf(rim)} fill={tray.top} stroke={tray.top} strokeWidth={0.25} />
      {face(front, tray)}
      <rect x={x0 + 14} y={y + 5.5} width={12} height={2.2} rx={1.1} fill={tray.side} />
    </>
  );
};

const folder: Draw = (c) => {
  const backT = solid(tone(c, -0.14));
  const s = solid(c);
  return (
    <>
      <Ground cx={33} rx={22} />
      {block(
        [
          [9, 13],
          [23, 13],
          [27, 17.5],
          [50, 17.5],
          [50, 49],
          [9, 49],
        ],
        2.5,
        backT,
      )}
      {block(back(rect(14, 20, 30, 26), 1.5), 1, paper(c), { edge: true })}
      {lines(18, [24, 28.5], [16, 11], c)}
      {block(
        [
          [16, 28],
          [56, 28],
          [50.5, 51],
          [9, 51],
        ],
        2.5,
        s,
      )}
    </>
  );
};

const share: Draw = (c) => {
  const s = solid(c);
  const N: Pt = [55, 10];
  const L: Pt = [8, 30];
  const M: Pt = [26.5, 36];
  const B: Pt = [36, 54];
  const K: Pt = [27, 47];
  return (
    <>
      <Ground cx={32} cy={58} rx={16} ry={2.4} />
      <path d={pathOf([M, K, B])} fill={s.side} stroke={s.side} strokeWidth={0.4} strokeLinejoin="round" />
      <path d={pathOf([N, M, B])} fill={s.front} stroke={s.front} strokeWidth={0.4} strokeLinejoin="round" />
      <path d={pathOf([N, L, M])} fill={s.top} stroke={s.top} strokeWidth={0.4} strokeLinejoin="round" />
    </>
  );
};

/* ---------- Số liệu ---------- */

const stack: Draw = (c) => {
  const p = paper(c);
  const dep = 19;
  const [dx, dy] = DEPTH;
  const top = 34;
  const x = 8.5;
  return (
    <>
      <Ground cx={31} rx={21} />
      {block(rect(9, 47, 34, 7), dep, solid(c))}
      {block(rect(10.5, 40.5, 34, 6.5), dep, soft(c), { edge: true })}
      {block(rect(x, top, 34, 6.5), dep, p, { edge: true })}
      {[0.3, 0.5, 0.7].map((z, i) => (
        <line
          key={z}
          x1={x + 6 + dx * dep * z}
          y1={top + dy * dep * z}
          x2={x + 6 + [20, 16, 22][i] + dx * dep * z}
          y2={top + dy * dep * z}
          stroke={p.side}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      ))}
    </>
  );
};

const globe: Draw = (c) => {
  const s = solid(c);
  const stand = solid(tone(c, -0.2));
  const cx = 31;
  const cy = 26;
  const r = 16;
  const line = { fill: "none", stroke: s.top, strokeWidth: 1.1 } as const;
  return (
    <>
      <Ground cx={34} rx={16} />
      <path
        d={`M${cx - 1.7} ${cy + 19.4}A19.5 19.5 0 0 1 ${cx - 11.2} ${cy - 16}`}
        fill="none"
        stroke={stand.side}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      {block(rect(29, 45, 4.5, 6), 2, stand)}
      {block(roundRect(19, 50, 24, 4.5, 1.5), 8, stand)}
      {sphere(cx, cy, r, s)}
      <ellipse cx={cx} cy={cy} rx={7} ry={r} {...line} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} {...line} />
      <path d={`M${cx - 13.6} ${cy - 8} Q${cx} ${cy - 5} ${cx + 13.6} ${cy - 8}`} {...line} />
      <path d={`M${cx - 13.6} ${cy + 8} Q${cx} ${cy + 11} ${cx + 13.6} ${cy + 8}`} {...line} />
    </>
  );
};

const clock: Draw = (c) => {
  const s = solid(c);
  const p = paper(c);
  const cx = 30;
  const cy = 32;
  const recess = 2;
  const [fx, fy] = [cx + DEPTH[0] * recess, cy + DEPTH[1] * recess];
  return (
    <>
      <Ground cx={33} rx={20} />
      {ring(circle(cx, cy, 21, 56), circle(cx, cy, 16, 48), 5, s, { holeDepth: recess, glass: p.front })}
      {[0, 90, 180, 270].map((deg) => (
        <rect
          key={deg}
          x={fx - 0.9}
          y={fy - 13.6}
          width={1.8}
          height={3.4}
          rx={0.9}
          fill={tone(c, 0.5)}
          transform={`rotate(${deg} ${fx} ${fy})`}
        />
      ))}
      <line x1={fx} y1={fy} x2={fx - 5.6} y2={fy - 5} stroke={s.side} strokeWidth={2.6} strokeLinecap="round" />
      <line x1={fx} y1={fy} x2={fx + 7.4} y2={fy - 7.2} stroke={s.side} strokeWidth={2} strokeLinecap="round" />
      <circle cx={fx} cy={fy} r={2} fill={s.front} />
    </>
  );
};

/* ---------- Trạng thái rỗng ---------- */

const searchEmpty: Draw = (c) => {
  const s = solid(c);
  const cx = 27;
  const cy = 27;
  const handle = capsule(cx + 22.5 * Math.SQRT1_2, cy + 22.5 * Math.SQRT1_2, 17, 7.5, 45);
  return (
    <>
      <Ground cx={33} rx={20} />
      {block(handle, 4, solid(tone(c, -0.15)))}
      {ring(circle(cx, cy, 17, 56), circle(cx, cy, 11.5, 48), 4, s, { glass: tone(c, 0.88) })}
    </>
  );
};

const star: Draw = (c) => (
  <>
    <Ground cx={33} rx={19} />
    {block(starShape(30, 33, 22, 10), 4.5, solid(c))}
  </>
);

const linkOff: Draw = (c) => {
  const s = solid(c);
  const link = (cx: number, cy: number) =>
    ring(capsule(cx, cy, 25, 13, -45), capsule(cx, cy, 15.5, 4.6, -45), 3, s);
  const mark = { stroke: tone(c, 0.25), strokeWidth: 2, strokeLinecap: "round" } as const;
  return (
    <>
      <Ground cx={32} rx={20} />
      {link(19.5, 44.5)}
      {link(44.5, 19.5)}
      <line x1={36} y1={38} x2={38} y2={43} {...mark} />
      <line x1={39} y1={35} x2={44} y2={37} {...mark} />
      <line x1={28} y1={26} x2={26} y2={21} {...mark} />
      <line x1={25} y1={29} x2={20} y2={27} {...mark} />
    </>
  );
};

const compass: Draw = (c) => {
  const s = solid(c);
  const p = paper(c);
  const sf = soft(c);
  const cx = 30;
  const cy = 33;
  const recess = 2;
  const fx = cx + DEPTH[0] * recess;
  const fy = cy + DEPTH[1] * recess;
  const nTip: Pt = [fx + 9, fy - 9];
  const sTip: Pt = [fx - 9, fy + 9];
  const l: Pt = [fx - 2.6, fy - 2.6];
  const rr: Pt = [fx + 2.6, fy + 2.6];
  const o: Pt = [fx, fy];
  return (
    <>
      <Ground cx={33} rx={20} />
      {ring(circle(cx, cy, 21, 56), circle(cx, cy, 16, 48), 4.5, s, { holeDepth: recess, glass: p.front })}
      {[0, 90, 180, 270].map((deg) => (
        <rect
          key={deg}
          x={fx - 0.9}
          y={fy - 13.6}
          width={1.8}
          height={3}
          rx={0.9}
          fill={tone(c, 0.55)}
          transform={`rotate(${deg} ${fx} ${fy})`}
        />
      ))}
      <path d={pathOf([nTip, l, o])} fill={s.top} />
      <path d={pathOf([nTip, o, rr])} fill={s.front} />
      <path d={pathOf([sTip, l, o])} fill={sf.top} />
      <path d={pathOf([sTip, o, rr])} fill={sf.side} />
      <circle cx={fx} cy={fy} r={1.5} fill={p.top} />
    </>
  );
};

const users: Draw = (c) => {
  const s = solid(c);
  const b = soft(c);
  return (
    <>
      <Ground cx={33} rx={21} />
      {block(roundRect(31, 29, 20, 19, [10, 10, 1.5, 1.5]), 4, b)}
      {sphere(41, 20, 6.4, b)}
      {block(roundRect(12, 35, 27, 20, [13, 13, 2, 2]), 4.5, s)}
      {sphere(25.5, 24.5, 8.2, s)}
    </>
  );
};

const fileQuestion: Draw = (c) => {
  const glyph = paper(c).top;
  return (
    <>
      <Ground cx={32} rx={19} />
      {sheet(12, 8, 30, 44, 8, c, 3)}
      {lines(16, [18, 23, 28, 33], [14, 18, 12, 9], c)}
      {badge(43, 44, 10, c, 3)}
      <path
        d="M39.6 41.6a3.5 3.5 0 1 1 5.3 3c-1.3.8-1.9 1.5-1.9 2.8"
        fill="none"
        stroke={glyph}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={43} cy={50.6} r={1.4} fill={glyph} />
    </>
  );
};

const ICONS = {
  proposals: { color: "#9B4148", draw: proposals },
  "company-profiles": { color: "#3F6E6A", draw: companyProfiles },
  quotations: { color: "#B7791F", draw: quotations },
  contracts: { color: "#52525B", draw: contracts },
  presentations: { color: "#C2603A", draw: presentations },
  portfolios: { color: "#6B7A3A", draw: portfolios },
  "brand-assets": { color: "#B4536A", draw: brandAssets },
  "doc-new": { color: "#9B4148", draw: docNew },
  upload: { color: "#3F6E6A", draw: upload },
  folder: { color: "#B7791F", draw: folder },
  share: { color: "#C2603A", draw: share },
  stack: { color: "#9B4148", draw: stack },
  globe: { color: "#3F6E6A", draw: globe },
  clock: { color: "#B7791F", draw: clock },
  "search-empty": { color: "#71717A", draw: searchEmpty },
  star: { color: "#B7791F", draw: star },
  "link-off": { color: "#71717A", draw: linkOff },
  compass: { color: "#9B4148", draw: compass },
  users: { color: "#3F6E6A", draw: users },
  "file-question": { color: "#71717A", draw: fileQuestion },
} as const satisfies Record<string, { color: string; draw: Draw }>;

export type Icon3DName = keyof typeof ICONS;

export const ICON_3D_NAMES = Object.keys(ICONS) as Icon3DName[];

/** Icon 3D phong cách clay-flat: chỉ màu đặc, chiều sâu bằng các mặt phẳng. */
export function Icon3D({
  name,
  size = 44,
  color,
  className,
}: {
  name: Icon3DName;
  size?: number;
  color?: string;
  className?: string;
}) {
  const icon = ICONS[name];
  return (
    <svg
      aria-hidden
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {icon.draw(color ?? icon.color)}
    </svg>
  );
}
