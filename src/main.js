import Phaser from 'phaser'
import GameScene from './game/scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#1e1e1e',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,     // ✅ เต็มจอ/ปรับตามหน้าต่าง
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
}

new Phaser.Game(config)
