// src/game/entities/Projectile.js
import Phaser from 'phaser'

export default class Projectile extends Phaser.GameObjects.Arc {
  constructor(scene, x, y, target, spec = {}) {
    const r = spec.radius ?? 3
    const color = spec.color ?? 0xffffff
    super(scene, x, y, r, 0, 360, false, color)
    scene.add.existing(this)

    this.scene = scene
    this.target = target

    this.speed = spec.speed ?? 650
    this.damage = spec.damage ?? 10

    this._maxLife = 2200
    this._life = 0
  }

  update(delta) {
    if (!this.active) return

    this._life += delta
    if (this._life >= this._maxLife) {
      this.destroy()
      return
    }

    if (!this.target || !this.target.active || this.target.isDead) {
      this.destroy()
      return
    }

    const dx = this.target.x - this.x
    const dy = this.target.y - this.y
    const dist = Math.hypot(dx, dy)

    if (dist < 8) {
      this.scene.damageEnemy?.(this.target, this.damage)
      this.destroy()
      return
    }

    const step = this.speed * (delta / 1000)
    this.x += (dx / dist) * step
    this.y += (dy / dist) * step
  }
}
