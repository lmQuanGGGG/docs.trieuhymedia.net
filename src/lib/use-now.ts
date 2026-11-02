"use client";

import { useState } from "react";

/** Mốc thời gian cố định trong vòng đời component (tránh gọi Date.now() khi render) */
export function useNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}
