import { xpForSeconds } from '../utils/xp';
import { xpForLevel, levelFromXp } from '../utils/levels';

test('xpForSeconds calculates correct XP', ()=>{
  expect(xpForSeconds('study', 3600)).toBe(40);
  expect(xpForSeconds('coding', 1800)).toBe(25);
  expect(xpForSeconds('reading', 7200)).toBe(60);
});

test('xpForLevel and levelFromXp are consistent', ()=>{
  expect(xpForLevel(1)).toBe(0);
  const xp = xpForLevel(3);
  const lvl = levelFromXp(xp);
  expect(lvl.level).toBeGreaterThanOrEqual(3);
});
