import Phaser from 'phaser'

export default class GoldMine extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'img_goldmine')
    
    this.scene = scene
    this.setDepth(10) 
    
    this.level = 1
    this.maxLevel = 5
    this.amount = 15
    this.interval = 3000 // ms
    this.timer = 0
    
    this.setInteractive()
    scene.add.existing(this)
  }

  update(delta) {
    this.timer += delta
    if (this.timer >= this.interval) {
      this.timer = 0
      this.produceGold()
    }
  }

  produceGold() {
    this.scene.money += this.amount
    this.scene.updateHUD() 
    
    const t = this.scene.add.text(this.x, this.y - 20, `+${this.amount}`, {
      fontFamily: 'monospace',
      fontSize: '14px', 
      color: '#ffd166', 
      stroke: '#000', 
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(100)
    
    this.scene.tweens.add({
      targets: t, 
      y: t.y - 30, 
      alpha: 0, 
      duration: 800,
      onComplete: () => t.destroy()
    })
  }

  canUpgrade() { return this.level < this.maxLevel }
  
  getUpgradeCost() {
    return 100 + (this.level - 1) * 50
  }

  upgrade() {
    if (!this.canUpgrade()) return
    this.level++
    this.amount += 5
    this.interval = Math.max(1000, this.interval - 200)
  }

  getSellRefund() {
    return Math.floor((100 + (this.level - 1) * 50) * 0.6)
  }
}