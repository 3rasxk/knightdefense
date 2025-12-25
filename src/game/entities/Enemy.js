import Phaser from 'phaser'

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, path, cfg = {}) {
    const texture = cfg.texture || 'monster_run'
    super(scene, path[0].x, path[0].y, texture) 
    
    this.scene = scene
    this.path = path
    this.index = 0

    this.type = cfg.key || 'normal'
    this.hp = cfg.hp || 100
    this.maxHP = this.hp
    this.baseSpeed = cfg.speed || 80
    this.speed = this.baseSpeed
    this.reward = cfg.reward || 10
    this.hpColor = cfg.hpColor || 0xff0000

    this.isDead = false
    this.reachedEnd = false
    this._slowPct = 0
    this._slowUntil = 0

    this.setScale(cfg.scale || 0.7)
    this.setDepth(200)
    
    if (cfg.animKey && this.scene.anims.exists(cfg.animKey)) {
        this.play(cfg.animKey)
    }

    this.hpBar = scene.add.graphics().setDepth(201)
    this.hpBarW = 40
    this.hpBarH = 5
    this.hpBarYOffset = 50; 
    
    scene.add.existing(this)
    this.drawHpBar()
  }
  
  // ... (rest same as before)
  applySlow(pct, durMs) {
    const now = this.scene.time.now
    const p = Phaser.Math.Clamp(pct ?? 0.2, 0, 0.85)
    const until = now + Math.max(100, durMs ?? 800)
    this._slowPct = Math.max(this._slowPct, p)
    this._slowUntil = Math.max(this._slowUntil, until)
  }

  update(delta) {
    if (!this.active || this.isDead || this.reachedEnd) return
    if (this.index >= this.path.length - 1) return

    const now = this.scene.time.now
    if (now > this._slowUntil) this._slowPct = 0
    const slowMul = 1 - this._slowPct
    this.speed = Math.max(10, this.baseSpeed * slowMul)

    const target = this.path[this.index + 1]
    if (!target) { this.destroy(); return; }

    const dx = target.x - this.x
    const dy = target.y - this.y
    const dist = Math.hypot(dx, dy)

    if (dx < 0) this.setFlipX(true) 
    else if (dx > 0) this.setFlipX(false)

    if (dist < 2) {
      this.index++
      if (this.index >= this.path.length - 1) {
        this.reachedEnd = true
        this.scene.onEnemyReachGoal?.(this)
      }
      return
    }

    const step = this.speed * (delta / 1000)
    this.x += (dx / dist) * step
    this.y += (dy / dist) * step

    this.drawHpBar()
  }

  drawHpBar() {
    if (!this.hpBar || !this.active) return

    const ratio = this.maxHP <= 0 ? 0 : Phaser.Math.Clamp(this.hp / this.maxHP, 0, 1)
    const x0 = this.x - this.hpBarW / 2
    const y0 = this.y - this.hpBarYOffset

    this.hpBar.clear()
    this.hpBar.fillStyle(0x000000, 0.6)
    this.hpBar.fillRect(x0 - 1, y0 - 1, this.hpBarW + 2, this.hpBarH + 2)

    let fillColor = (this.type === 'boss') ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(fillColor, 1)
    this.hpBar.fillRect(x0, y0, this.hpBarW * ratio, this.hpBarH)

    const now = this.scene.time.now
    if (this._slowPct > 0 && now <= this._slowUntil) {
      this.hpBar.fillStyle(0x66ccff, 1)
      this.hpBar.fillCircle(this.x + this.hpBarW / 2 - 6, y0 - 6, 3)
    }
  }

  destroy(fromScene) {
    if (this.hpBar) {
      this.hpBar.destroy()
      this.hpBar = null
    }
    super.destroy(fromScene)
  }
}