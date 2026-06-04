export function xpForLevel(n: number) {
  if (n <= 1) return 0;
  return 250 * (n - 1) * n;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const next = xpForLevel(level + 1) - xpForLevel(level);
  const progress = xp - xpForLevel(level);
  return { level, progress, next };
}
