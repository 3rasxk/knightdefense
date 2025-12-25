export const MONSTER_TYPES = {
  normal: {
    key: 'normal',
    hpBase: 50,
    speed: 60,
    reward: 10,
    scale: 0.6,
    // ต้องตรงกับที่ load.spritesheet ใน GameScene
    texture: 'monster_run', 
    animKey: 'monster_run_anim',
    hpColor: 0xff0000 
  },
  runner: { 
    key: 'runner',
    hpBase: 30,
    speed: 110, // วิ่งไว
    reward: 15,
    scale: 0.55,
    texture: 'archer_run', // ใช้ตัว Archer เป็นตัววิ่งไว
    animKey: 'archer_run_anim',
    hpColor: 0xff8800
  },
  tank: { 
    key: 'tank',
    hpBase: 150,
    speed: 35, // เดินช้า
    reward: 25,
    scale: 0.75,
    texture: 'warrior_run', // ใช้ Warrior เป็นตัวอึด
    animKey: 'warrior_run_anim',
    hpColor: 0x0000ff
  },
  boss: { 
    key: 'boss',
    hpBase: 800,
    speed: 25,
    reward: 200,
    scale: 1.1, // ตัวใหญ่
    texture: 'lancer_run', // ใช้ Lancer เป็นบอส
    animKey: 'lancer_run_anim',
    hpColor: 0xffff00 
  }
}

export function chooseMonsterType(wave) {
  // บอสทุก 10 เวฟ
  if (wave % 10 === 0) return 'boss'

  // Wave 1-3: ธรรมดาล้วน
  if (wave <= 3) return 'normal'

  // Wave 4+: สุ่มผสม
  const rand = Math.random()
  if (rand < 0.3) return 'runner' // 30% เจอตัววิ่ง
  if (rand < 0.5) return 'tank'   // 20% เจอตัวอึด
  return 'normal'                 // 50% ตัวธรรมดา
}

export function buildMonsterConfig(typeKey, wave) {
  const base = MONSTER_TYPES[typeKey] || MONSTER_TYPES.normal
  
  // สูตรคำนวณเลือดเพิ่มตาม wave (ยิ่งไกลยิ่งอึด)
  const hpMultiplier = 1 + (wave - 1) * 0.4
  
  return {
    ...base,
    hp: Math.floor(base.hpBase * hpMultiplier),
    // ส่ง texture/animKey ไปด้วยเพื่อให้ Enemy.js รู้ว่าต้องใช้อันไหน
    texture: base.texture,
    animKey: base.animKey
  }
}