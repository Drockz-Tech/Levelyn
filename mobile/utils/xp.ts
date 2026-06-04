export const XP_RATE = {
  study: 40,
  coding: 50,
  reading: 30,
} as const;

export function xpForSeconds(category: keyof typeof XP_RATE, seconds: number) {
  const rate = XP_RATE[category];
  return Math.round((seconds / 3600) * rate);
}
