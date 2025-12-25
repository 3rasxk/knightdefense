import Phaser from 'phaser'
import { UNITS } from '../data/units.js'

export default class Tower extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, unitKey) {
    const unitDef = UNITS[unitKey] || UNITS.knight
    
    let initialTexture = 'knight_idle';
    if (unitKey === 'archer') initialTexture = 'archer_idle';
    if (unitKey === 'monk') initialTexture = 'monk_idle';

    super(scene, x, y, initialTexture) 
    
    this.scene = scene
    this.unitKey = unitKey
    this.unitDef = unitDef 
    
    this.level = 1
    this.maxLevel = 3
    this.range = unitDef.base.range
    this.damage = unitDef.base.damage
    this.fireRate = unitDef.base.fireRate
    this.lastFired = 0
    
    this.buffMultiplier = 1;
    this.abilityCooldown = 0;

    if (unitDef.scale) this.setScale(unitDef.scale)
    this.setFlipX(true) 
    this.setDepth(200) 
    
    let animIdle = `${unitKey}_idle`;
    if (this.scene.anims.exists(animIdle)) {
        this.play(animIdle)
    }
    
    this.targetMode = unitDef.base.targetMode || 'first'
    this.target = null
    
    this.setInteractive()
    scene.add.existing(this)
  }

  update(enemies, delta) {
    if (this.lastFired > 0) this.lastFired -= delta

    if (!this.target || !this.target.active || this.target.isDead || 
        Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) > this.range) {
      this.target = this.findTarget(enemies)
    }

    if (this.target && this.target.active) {
        if (this.target.x < this.x) {
            this.setFlipX(true)
        } else {
            this.setFlipX(false)
        }
    }

    if (this.target && this.lastFired <= 0) {
      this.fire()
      this.lastFired = this.fireRate
    }
  }

  findTarget(enemies) {
    const inRange = enemies.getChildren().filter(e => {
        return e.active && !e.isDead && 
               Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= this.range
    })
    if (inRange.length === 0) return null
    if (this.targetMode === 'first') return inRange.reduce((a, b) => (a.progress > b.progress ? a : b))
    else if (this.targetMode === 'fastest') return inRange.reduce((a, b) => (a.speed > b.speed ? a : b))
    else if (this.targetMode === 'highestHP') return inRange.reduce((a, b) => (a.hp > b.hp ? a : b))
    return inRange[0]
  }

  fire() {
    if (this.unitKey === 'knight') {
        this.fireKnight();
    } else if (this.unitKey === 'archer') {
        this.fireArcher();
    } else {
        this.fireStandard(); // Monk
    }
  }

  // ✅ Knight: Full AOE Attack (360 องศา)
  fireKnight() {
      this.play('knight_attack1').once('animationcomplete', () => {
          this.play('knight_idle');
      });

      // วนลูปศัตรูทั้งหมดในระยะแล้วทำดาเมจ
      const enemies = this.scene.enemies.getChildren();
      enemies.forEach(e => {
          if (e.active && !e.isDead && Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= this.range) {
              const finalDamage = this.damage * this.buffMultiplier;
              this.scene.damageEnemy(e, finalDamage);
          }
      });
  }

  // ✅ Archer: Shoot Projectile (ลูกธนู)
  fireArcher() {
      if (!this.target) return;

      this.play('archer_attack1').once('animationcomplete', () => {
          this.play('archer_idle');
      });

      // สร้างลูกธนู
      const arrow = this.scene.add.image(this.x, this.y, 'img_arrow');
      arrow.setDepth(205);
      
      // หมุนลูกธนูไปหาเป้าหมาย
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      arrow.setRotation(angle);

      // ยิงลูกธนู (Tween)
      this.scene.tweens.add({
          targets: arrow,
          x: this.target.x,
          y: this.target.y,
          duration: 200, // ความเร็วลูกธนู
          onComplete: () => {
              arrow.destroy();
              if (this.target && this.target.active && !this.target.isDead) {
                  const finalDamage = this.damage * this.buffMultiplier;
                  this.scene.damageEnemy(this.target, finalDamage);
              }
          }
      });
  }

  fireStandard() {
      let animName = `${this.unitKey}_attack1`;
      if (this.scene.anims.exists(animName)) {
          this.play(animName).once('animationcomplete', () => {
              const idle = `${this.unitKey}_idle`
              if(this.active && this.scene.anims.exists(idle)) this.play(idle);
          });
      }
      
      if (this.target) {
          const finalDamage = this.damage * this.buffMultiplier;
          this.scene.damageEnemy(this.target, finalDamage)
      }
  }

  // ✅ Monk: AOE Buff (บัฟเพื่อนในวงรัศมี)
  castAbility() {
      if (this.unitKey !== 'monk') return;

      const now = this.scene.time.now;
      if (now < this.abilityCooldown) {
          this.scene.toast?.("Cooldown!", this.x, this.y - 40);
          return;
      }

      this.abilityCooldown = now + 10000; // Cooldown 10s
      this.scene.toast?.("AOE BUFF!", this.x, this.y - 40);

      // เล่นท่า
      this.play('monk_attack1').once('animationcomplete', () => {
          this.play('monk_idle');
      });

      // หาเพื่อนในระยะ
      const towers = this.scene.towers.getChildren();
      const buffedTowers = [];

      towers.forEach(t => {
          if (t !== this && t.active && Phaser.Math.Distance.Between(this.x, this.y, t.x, t.y) <= this.range) {
              t.buffMultiplier = 2; // Damage x2
              t.setTint(0x00ff00); // ตัวเขียว
              buffedTowers.push(t);
          }
      });

      // ยกเลิกบัฟเมื่อครบ 5 วิ
      this.scene.time.delayedCall(5000, () => {
          buffedTowers.forEach(t => {
              if (t.active) {
                  t.buffMultiplier = 1;
                  t.clearTint();
              }
          });
      });
  }

  canUpgrade() { return this.level < this.maxLevel }
  getUpgradeCost() { return this.unitDef.upgradeCost(this.level) }
  upgrade() {
      if (!this.canUpgrade()) return
      this.level++
      this.unitDef.upgrade(this.level, this)
  }
  getSellRefund() { return this.unitDef.sellRefund(this.level) }
}