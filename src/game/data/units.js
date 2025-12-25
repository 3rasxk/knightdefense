// src/game/data/units.js
export const UNITS = {
  knight: {
    label: 'Knight',
    cost: 60,
    size: 34,
    color: 0xcfcfcf,
    texture: 'knight_idle',
    animKey: 'knight_idle',
    scale: 0.9,
    base: {
      range: 120,
      damage: 26,
      fireRate: 900, 
      targetMode: 'first',
      attackType: 'cone', 
      cone: { radius: 120, angleDeg: 26 },
    },
    // ✅ เพิ่ม if เช็คก่อนใช้ s.cone
    upgrade: (level, s) => {
      s.damage += 8
      s.fireRate = Math.max(520, s.fireRate - 70)
      if (s.cone) s.cone.radius += 6 
    },
    upgradeCost: (level) => 70 + (level - 1) * 35 + (level - 1) * (level - 1) * 10,
    sellRefund: (level) => Math.floor(0.6 * (70 + (level - 1) * 60)),
  },

  archer: {
    label: 'Archer',
    cost: 60,
    size: 32,
    color: 0x66ccff,
    texture: 'knight_idle',
    animKey: 'knight_idle',
    scale: 0.8, 
    base: {
      range: 300,
      damage: 18,
      fireRate: 700,
      targetMode: 'first',
      attackType: 'projectile',
      projectile: { speed: 780, radius: 3, color: 0xffffff },
    },
    upgrade: (level, s) => {
      s.damage += 6
      s.range += 18
      s.fireRate = Math.max(360, s.fireRate - 60)
    },
    upgradeCost: (level) => 60 + (level - 1) * 30 + (level - 1) * (level - 1) * 8,
    sellRefund: (level) => Math.floor(0.6 * (60 + (level - 1) * 50)),
  },

  lancer: {
    label: 'Lancer',
    cost: 110,
    size: 36,
    color: 0x99ffcc,
    texture: 'knight_idle',
    animKey: 'knight_idle',
    scale: 0.85,
    base: {
      range: 115,
      damage: 20,
      fireRate: 950,
      targetMode: 'first',
      attackType: 'circle', 
      circle: { radius: 130 },
    },
    // ✅ เพิ่ม if เช็คก่อนใช้ s.circle
    upgrade: (level, s) => {
      s.damage += 7
      s.fireRate = Math.max(520, s.fireRate - 55)
      if (s.circle) s.circle.radius += 8
    },
    upgradeCost: (level) => 110 + (level - 1) * 55,
    sellRefund: (level) => Math.floor(0.6 * (110 + (level - 1) * 70)),
  },

  monk: {
    label: 'Monk',
    cost: 140,
    size: 34,
    color: 0xffd166,
    texture: 'knight_idle',
    animKey: 'knight_idle',
    scale: 0.8,
    base: {
      range: 190,
      damage: 10,
      fireRate: 820,
      targetMode: 'first',
      attackType: 'projectile',
      projectile: { speed: 700, radius: 3, color: 0xfff2b0 },
      ability: {
        key: 'bless',
        radius: 230,
        cooldownMs: 7000,
        durationMs: 3500,
        buff: { damageMul: 1.25, atkSpeedMul: 1.2 },
      },
    },
    upgrade: (level, s) => {
      s.damage += 3
      s.range += 10
      if (s.ability) {
        s.ability.radius += 12
        s.ability.durationMs += 250
      }
    },
    upgradeCost: (level) => 140 + (level - 1) * 70,
    sellRefund: (level) => Math.floor(0.6 * (140 + (level - 1) * 80)),
  },
}