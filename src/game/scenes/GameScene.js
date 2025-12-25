import Phaser from 'phaser'
import Enemy from '../entities/Enemy.js'
import Tower from '../entities/Tower.js'
import GoldMine from '../entities/GoldMine.js'

import { chooseMonsterType, buildMonsterConfig } from '../data/monsters.js'
import { UNITS } from '../data/units.js'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    // 1. Load Map
    this.load.tilemapTiledJSON('map', 'assets/maps/map.json')

    // 2. Load Tilesets
    this.load.image('img_water_bg', 'assets/tilesets/terrain/Water Background color.png')
    this.load.image('img_foam', 'assets/tilesets/terrain/Water Foam.png')
    this.load.image('img_bridge', 'assets/tilesets/terrain/bridge.png')
    this.load.image('img_partshadow', 'assets/tilesets/terrain/part_shadow.png') 
    this.load.image('img_low', 'assets/tilesets/terrain/low.png')
    this.load.image('img_mid', 'assets/tilesets/terrain/mid.png')
    this.load.image('img_part', 'assets/tilesets/terrain/part.png')
    this.load.image('img_high', 'assets/tilesets/terrain/high.png')

    this.load.image('img_tree1', 'assets/tilesets/trees/tree1.png')
    this.load.image('img_tree2', 'assets/tilesets/trees/tree2.png')
    this.load.image('img_tree3', 'assets/tilesets/trees/tree3.png')
    this.load.image('img_tree4', 'assets/tilesets/trees/tree4.png')
    this.load.image('img_wood', 'assets/tilesets/trees/wood.png') 

    this.load.image('img_bush1', 'assets/tilesets/decorations/Bushe1.png')
    this.load.image('img_bush2', 'assets/tilesets/decorations/Bushe2.png')
    this.load.image('img_rock1', 'assets/tilesets/decorations/Rock1.png')
    this.load.image('img_mushroom1', 'assets/tilesets/decorations/mushroom1.png')
    this.load.image('img_way', 'assets/tilesets/decorations/way.png')

    this.load.image('img_castle', 'assets/tilesets/building/castle.png')
    this.load.image('img_tower', 'assets/tilesets/building/tower.png')
    this.load.image('img_house', 'assets/tilesets/building/house.png')
    
    this.load.image('img_goldmine', 'assets/units/goldmine/GoldMine_Active.png')

    // ✅ Load Arrow Texture
    this.load.image('img_arrow', 'assets/units/archer/Arrow.png')

    // Units
    const unitSize = 192; 
    this.load.spritesheet('knight_idle', 'assets/units/knight/Warrior_Idle.png', { frameWidth: unitSize, frameHeight: unitSize });
    this.load.spritesheet('knight_attack1', 'assets/units/knight/Warrior_Attack1.png', { frameWidth: unitSize, frameHeight: unitSize });
    this.load.spritesheet('knight_attack2', 'assets/units/knight/Warrior_Attack2.png', { frameWidth: unitSize, frameHeight: unitSize });

    this.load.spritesheet('archer_idle', 'assets/units/archer/Archer_Idle.png', { frameWidth: unitSize, frameHeight: unitSize });
    this.load.spritesheet('archer_attack1', 'assets/units/archer/Archer_Shoot.png', { frameWidth: unitSize, frameHeight: unitSize });

    this.load.spritesheet('monk_idle', 'assets/units/monk/Idle.png', { frameWidth: unitSize, frameHeight: unitSize });
    this.load.spritesheet('monk_attack1', 'assets/units/monk/Buff.png', { frameWidth: unitSize, frameHeight: unitSize });

    // Monsters
    const mSize = 192;
    this.load.spritesheet('monster_run', 'assets/monsters/run/Run.png', { frameWidth: mSize, frameHeight: mSize });
    this.load.spritesheet('archer_run', 'assets/monsters/run/Archer_Run.png', { frameWidth: mSize, frameHeight: mSize });
    this.load.spritesheet('lancer_run', 'assets/monsters/run/Lancer_Run.png', { frameWidth: mSize, frameHeight: mSize });
    this.load.spritesheet('warrior_run', 'assets/monsters/run/Warrior_Run.png', { frameWidth: mSize, frameHeight: mSize });
  }

  create() {
    this.input.mouse?.disableContextMenu()
    const cam = this.cameras.main
    cam.setZoom(1)
    cam.roundPixels = true
    this.input.on('wheel', (pointer, go, dx, dy, dz, event) => event?.preventDefault?.())

    this.createAnimations()

    this.map = this.make.tilemap({ key: 'map' }) 
    this.tileSize = 64

    const mapTilesets = [];
    const addTs = (tiledName, key) => {
        const ts = this.map.addTilesetImage(tiledName, key);
        if (ts) mapTilesets.push(ts);
    };

    addTs('Water Background color', 'img_water_bg');
    addTs('Water Foam', 'img_foam');
    addTs('bridge', 'img_bridge');
    addTs('partshadow', 'img_partshadow');
    addTs('part_shadow', 'img_partshadow'); 
    addTs('low', 'img_low');
    addTs('mid', 'img_mid');
    addTs('part', 'img_part');
    addTs('high', 'img_high');
    addTs('house', 'img_house'); 
    addTs('../tilesets/building/house.png', 'img_house');
    addTs('castle', 'img_castle'); 
    addTs('tower', 'img_tower');
    addTs('tree1', 'img_tree1'); addTs('tree2', 'img_tree2');
    addTs('tree3', 'img_tree3'); addTs('tree4', 'img_tree4');
    addTs('wood', 'img_wood');
    addTs('Bushe1', 'img_bush1'); addTs('Bushe2', 'img_bush2');
    addTs('Rock1', 'img_rock1');  addTs('mushroom1', 'img_mushroom1');
    addTs('way', 'img_way');

    const layerOrder = [
        'water', 'foam_water', 'foam_water2', 'foam_water3', 'bridge_shadow',
        'low_2', 'low', 'mid', 'mid_side', 'part_shadow', 'part_shadow2', 'part',
        'bridge', 'bushe', 'bushe2', 'high', 'house', 
        'mushroom', 'rock', 'way', 'high_side', 'wood',
        'tree6', 'tree5', 'tree4', 'tree2', 'tree', 'tree3', 'bushe_tower2'
    ];

    let depthCounter = 0;
    layerOrder.forEach(layerName => {
        if (this.map.getLayerIndex(layerName) !== null) {
            const layer = this.map.createLayer(layerName, mapTilesets, 0, 0);
            if (layer) layer.setDepth(depthCounter++);
        }
    });

    this.mapWidth = this.map.widthInPixels
    this.mapHeight = this.map.heightInPixels
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight)
    cam.setBounds(0, 0, this.mapWidth, this.mapHeight)

    this.enemies = this.add.group()
    this.towers = this.add.group()
    this.buildings = this.add.group()
    this.projectiles = this.add.group()

    this.money = 400
    this.wave = 0
    this.isWaveRunning = false
    this.timeToNextWave = 1500
    this.baseMaxHP = 1000
    this.baseHP = 1000
    this.isGameOver = false

    const pathLayer = this.map.getObjectLayer('part_line')
    const polylineObj = pathLayer?.objects.find(o => o.polyline)
    this.path = []
    if (polylineObj) {
        polylineObj.polyline.forEach(p => {
            this.path.push({ x: polylineObj.x + p.x, y: polylineObj.y + p.y })
        })
    } else {
        this.path = [{x: 0, y: 300}, {x: this.mapWidth, y: 300}];
    }

    let castleFound = false
    const castleObjLayer = this.map.getObjectLayer('castle')
    if (castleObjLayer && castleObjLayer.objects) {
        castleObjLayer.objects.forEach(obj => {
            this.add.image(obj.x, obj.y, 'img_castle').setOrigin(0, 1).setDepth(depthCounter + 1)
            this.goal = { x: obj.x + obj.width/2, y: obj.y - obj.height/4 }
            castleFound = true
        })
    }
    if (!castleFound) {
        this.goal = this.path[this.path.length - 1] || { x: 0, y: 0 }
    }

    const towerObjLayer = this.map.getObjectLayer('tower')
    if (towerObjLayer && towerObjLayer.objects) {
        towerObjLayer.objects.forEach(obj => {
             this.add.image(obj.x, obj.y, 'img_tower').setOrigin(0, 1).setDepth(depthCounter + 1)
        })
    }
    
    this.towerSpots = [
        { x: 547, y: 640, radius: 45 },
        { x: 1122, y: 512, radius: 45 }
    ];

    this.baseSprite = this.add.rectangle(this.goal.x, this.goal.y, 120, 100, 0xff0000, 0).setStrokeStyle(2, 0xff0000, 0).setDepth(10)

    this.blockedCells = new Set()
    this.occupiedCells = new Set()
    this.buildBlockedFromPath() 

    const { cx, cy } = this.worldToCell(this.goal.x, this.goal.y)
    for(let dx=-1; dx<=1; dx++) {
        for(let dy=-1; dy<=1; dy++) {
            this.blockedCells.add(this.cellKey(cx+dx, cy+dy))
        }
    }

    this.placeMode = null
    this.selectedUnitKey = 'knight'
    this.ghost = null
    this.ghostOkColor = 0x39ff14 // ✅ สีเขียวสว่าง (Neon Green)
    this.selectedTower = null
    this.selectedMine = null
    this._uiHit = []
    
    this.uiLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(999999) 

    this.createGameHUD()
    this.updateHUD()
    this.updateBaseHUD()
    this.createUnitPickerUI()
    this.createBossBar()
    this.layoutUI()
    this.scale.on('resize', () => this.layoutUI())

    this.spawnEnemy(1)
    this.setupInputs()
  }

  cellKey(cx, cy) { return `${cx},${cy}` }
  worldToCell(x, y) { return { cx: Math.floor(x / this.tileSize), cy: Math.floor(y / this.tileSize) } }
  cellToWorldCenter(cx, cy) { return { x: cx * this.tileSize + this.tileSize / 2, y: cy * this.tileSize + this.tileSize / 2 } }
  isInsideMapCell(cx, cy) {
    const cols = Math.floor(this.mapWidth / this.tileSize)
    const rows = Math.floor(this.mapHeight / this.tileSize)
    return 0 <= cx && cx < cols && 0 <= cy && cy < rows
  }

  buildBlockedFromPath() {
    if (!this.path || this.path.length === 0) return;
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i]; const b = this.path[i + 1]
      const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y)
      const steps = Math.max(1, Math.floor(dist / (this.tileSize / 2)))
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const x = a.x + (b.x - a.x) * t
        const y = a.y + (b.y - a.y) * t
        const { cx, cy } = this.worldToCell(x, y)
        this.blockedCells.add(this.cellKey(cx, cy))
      }
    }
  }

  spawnEnemy(wave = 1) {
    const type = wave <= 2 ? 'normal' : chooseMonsterType(wave)
    const cfg = buildMonsterConfig(type, wave)
    const e = new Enemy(this, this.path, cfg)
    this.enemies.add(e)
  }

  startNextWave() {
    if (this.isGameOver) return
    if (this.isWaveRunning) return
    if (this.waveTimer) { this.waveTimer.remove(false); this.waveTimer = null }
    this.wave++
    this.isWaveRunning = true
    this.waveSpawnDone = false
    this.updateHUD()
    const txt = this.add.text(this.scale.width/2, this.scale.height/2, `WAVE ${this.wave}`, { fontSize: '48px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0)
    this.tweens.add({ targets: txt, alpha: 0, duration: 2000, onComplete: () => txt.destroy() })
    const count = 5 + this.wave
    let spawned = 0
    this.waveTimer = this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => {
        if (this.isGameOver) return
        this.spawnEnemy(this.wave)
        spawned++
        if (spawned >= count) { this.waveSpawnDone = true; this.waveTimer.remove(false); this.waveTimer = null }
      }
    })
  }

  createAnimations() {
      // Knight
      if(!this.anims.exists('knight_idle')) this.anims.create({ key: 'knight_idle', frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      if(!this.anims.exists('knight_attack1')) this.anims.create({ key: 'knight_attack1', frames: this.anims.generateFrameNumbers('knight_attack1', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      if(!this.anims.exists('knight_attack2')) this.anims.create({ key: 'knight_attack2', frames: this.anims.generateFrameNumbers('knight_attack2', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      
      // Archer
      if(!this.anims.exists('archer_idle')) this.anims.create({ key: 'archer_idle', frames: this.anims.generateFrameNumbers('archer_idle', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      if(!this.anims.exists('archer_attack1')) this.anims.create({ key: 'archer_attack1', frames: this.anims.generateFrameNumbers('archer_attack1', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });

      // Monk
      if(!this.anims.exists('monk_idle')) this.anims.create({ key: 'monk_idle', frames: this.anims.generateFrameNumbers('monk_idle', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      if(!this.anims.exists('monk_attack1')) this.anims.create({ key: 'monk_attack1', frames: this.anims.generateFrameNumbers('monk_attack1', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });

      // Monsters
      ['monster_run', 'archer_run', 'lancer_run', 'warrior_run'].forEach(m => {
          if(!this.anims.exists(`${m}_anim`)) this.anims.create({ key: `${m}_anim`, frames: this.anims.generateFrameNumbers(m, { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      });
  }

  setupInputs() {
    this.input.keyboard.on('keydown-ONE', () => { this.selectedUnitKey = 'knight'; this.setPlaceMode('tower') })
    this.input.keyboard.on('keydown-TWO', () => { this.selectedUnitKey = 'archer'; this.setPlaceMode('tower') })
    this.input.keyboard.on('keydown-FOUR', () => { this.selectedUnitKey = 'monk'; this.setPlaceMode('tower') })
    this.input.keyboard.on('keydown-B', () => this.setPlaceMode('GoldMine'))
    this.input.keyboard.on('keydown-ESC', () => this.setPlaceMode(null))
    
    this.input.keyboard.on('keydown-U', () => { if (this.selectedTower) this.handleTowerUpgrade(); else if (this.selectedMine) this.handleMineUpgrade() })
    this.input.keyboard.on('keydown-E', () => { if(this.selectedTower) this.sellSelectedTower(); if(this.selectedMine) this.sellSelectedMine() })
    
    this.input.keyboard.on('keydown-SPACE', () => { const t = this.selectedTower; if (t?.castAbility) { t.castAbility(); this.refreshTowerUI?.() } })

    this.input.on('pointerdown', (p) => {
        if (this.isGameOver || p.button === 2 || this.isPointerOverUI(p)) return
        if (this.placeMode) {
            const cam = this.cameras.main
            const wp = p.positionToCamera(cam)
            const { cx, cy } = this.worldToCell(wp.x, wp.y)
            if (this.canPlaceAt(cx, cy, wp.x, wp.y, this.selectedUnitKey)) {
                const towerSpot = this.findNearbyTowerSpot(wp.x, wp.y)
                let placeX, placeY;
                if (towerSpot) {
                    placeX = towerSpot.x; placeY = towerSpot.y - 20; 
                } else {
                    const pos = this.cellToWorldCenter(cx, cy); placeX = pos.x; placeY = pos.y;
                }
                if (this.placeMode === 'tower') this.tryPlaceTower(placeX, placeY, cx, cy)
                else if (this.placeMode === 'GoldMine') this.tryPlaceGoldMine(placeX, placeY, cx, cy)
            }
        } else {
            const hit = this.input.hitTestPointer(p)
            const hitUnit = hit.some(o => o instanceof Tower || o instanceof GoldMine)
            if (!hitUnit) { this.clearTowerSelection(); this.clearMineSelection() }
        }
    })

    this.input.on('pointermove', (p) => {
        if (this.placeMode && this.ghost) this.snapGhostToPointer()
        if (p.isDown && !this.placeMode && !this.isPointerOverUI(p)) {
             if (p.rightButtonDown()) {
                const cam = this.cameras.main
                cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom
                cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom
             }
        }
    })

    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if(pointer.button!==0 || this.placeMode || this.isPointerOverUI(pointer)) return
        if(gameObject instanceof Tower) this.selectTower(gameObject)
        else if(gameObject instanceof GoldMine) this.selectGoldMine(gameObject)
    })
  }

  // UI Helper Methods
  findNearbyTowerSpot(wx, wy) { return this.towerSpots.find(spot => Phaser.Math.Distance.Between(wx, wy, spot.x, spot.y) < spot.radius) }
  
  canPlaceAt(cx, cy, wx, wy, unitKey) {
    if (!this.isInsideMapCell(cx, cy)) return false
    const key = this.cellKey(cx, cy)
    if (this.blockedCells.has(key)) return false
    if (this.occupiedCells.has(key)) return false

    const towerSpot = this.findNearbyTowerSpot(wx, wy)
    const hasHigh = this.map.getTileAt(cx, cy, false, 'high') != null
    const hasMid = this.map.getTileAt(cx, cy, false, 'mid') != null

    if (unitKey === 'archer') return !!towerSpot || hasHigh || hasMid
    else { if (towerSpot) return false; if (hasHigh) return false; return hasMid }
  }

  snapGhostToPointer() {
    if (!this.placeMode || !this.ghost) return
    const cam = this.cameras.main
    const p = this.input.activePointer
    const wp = p.positionToCamera(cam)
    const { cx, cy } = this.worldToCell(wp.x, wp.y)
    
    const unitKey = (this.placeMode === 'tower') ? this.selectedUnitKey : 'GoldMine' 
    const ok = this.canPlaceAt(cx, cy, wp.x, wp.y, unitKey)
    
    const towerSpot = this.findNearbyTowerSpot(wp.x, wp.y)
    if (towerSpot) {
        if (this.placeMode === 'GoldMine') {
             // ...
        } else {
             this.ghost.setPosition(towerSpot.x, towerSpot.y - 20)
        }
    }
    else { const pos = this.cellToWorldCenter(cx, cy); this.ghost.setPosition(pos.x, pos.y) }

    if (this.placeRangeCircle) this.placeRangeCircle.setPosition(this.ghost.x, this.ghost.y)
    
    if (this.ghost.setTint) this.ghost.setTint(ok ? 0xffffff : 0xff3333)
    else this.ghost.fillColor = ok ? this.ghostOkColor : 0xff3333
  }

  tryPlaceTower(x, y, cx, cy) {
    const u = UNITS[this.selectedUnitKey] ?? UNITS.knight
    const COST = u.cost ?? 60
    if (this.money < COST) { this.toast?.(`Need ${COST}`, x, y - 20); return }
    const tower = new Tower(this, x, y, this.selectedUnitKey)
    this.towers.add(tower)
    this.money -= COST
    this.occupiedCells.add(this.cellKey(cx, cy))
    this.updateHUD()
    this.setPlaceMode(null)
  }

  tryPlaceGoldMine(x, y, cx, cy) {
    const COST = 80
    if (this.money < COST) { this.toast?.(`Need ${COST}`, x, y - 20); return }
    const mine = new GoldMine(this, x, y)
    this.buildings.add(mine)
    this.money -= COST
    this.occupiedCells.add(this.cellKey(cx, cy))
    this.updateHUD()
    this.setPlaceMode(null)
  }

  setPlaceMode(mode) {
    this.placeMode = mode
    if (this.ghost) { this.ghost.destroy(); this.ghost = null }
    if (this.placeRangeCircle) { this.placeRangeCircle.destroy(); this.placeRangeCircle = null }
    if (!mode) { this.refreshUnitPickerUI?.(); return }
    this.clearTowerSelection()
    this.clearMineSelection()
    
    if (mode === 'GoldMine') {
        this.ghost = this.add.sprite(0, 0, 'img_goldmine').setAlpha(0.7).setDepth(1000)
    } else {
        const u = UNITS[this.selectedUnitKey] ?? UNITS.knight
        const range = u.base?.range ?? 200
        let textureKey = 'knight_idle';
        if (this.selectedUnitKey === 'archer') textureKey = 'archer_idle';
        if (this.selectedUnitKey === 'monk') textureKey = 'monk_idle';

        if (this.textures.exists(textureKey)) {
            this.ghost = this.add.sprite(0, 0, textureKey).setAlpha(0.7).setDepth(1000)
            const animKey = `${this.selectedUnitKey}_idle`;
            if (this.anims.exists(animKey)) this.ghost.play(animKey);
            if (u.scale) this.ghost.setScale(u.scale)
            this.ghost.setFlipX(true) 
        } else {
            this.ghost = this.add.rectangle(0, 0, 32, 32, 0x39ff14, 0.5).setDepth(1000)
        }
        // ✅ Range Circle: ใช้สีเขียวสะท้อนแสง และเส้นขอบชัดๆ
        this.placeRangeCircle = this.add.circle(0, 0, range, 0x39ff14, 0.25).setStrokeStyle(2, 0x39ff14, 0.8).setDepth(999)
    }
    this.snapGhostToPointer()
    this.refreshUnitPickerUI?.()
  }

  update(time, delta) {
    if (this.isGameOver) return
    if (!this.isWaveRunning) { 
        this.timeToNextWave -= delta; 
        if (this.timeToNextWave <= 0) this.startNextWave() 
    }
    else { 
        if (this.waveSpawnDone && this.aliveEnemyCount() === 0) { 
            this.isWaveRunning = false; 
            this.timeToNextWave = 2200 
        } 
    }
    this.enemies.getChildren().forEach(e => { if(e.active) e.update(delta) })
    this.towers.getChildren().forEach(t => { if(t.active) t.update(this.enemies, delta) })
    this.buildings.getChildren().forEach(b => { if(b.active) b.update(delta) })
    this.projectiles.getChildren().forEach(p => { if(p.active) p.update(delta) })
    if (this.selectedTower && this.rangeCircle) this.rangeCircle.setPosition(this.selectedTower.x, this.selectedTower.y)
    if (this.selectedMine && this.mineSelectRing) this.mineSelectRing.setPosition(this.selectedMine.x, this.selectedMine.y)
    this.updateBossBar()
    this.refreshTowerUI?.()
    this.refreshMineUI?.()
  }

  markUIInteractive(go) { go.setScrollFactor?.(0); go.setDepth?.(999999); go.__isUI=true; this._uiHit.push(go); return go }
  isPointerOverUI(pointer) { return this.input.hitTestPointer(pointer).some(o => this._uiHit.includes(o)) }
  
  createGameHUD() {
    const ui = this.add.container(0, 0).setScrollFactor(0).setDepth(999999)
    this.uiLayer.add(ui)
    this.gameHUD = ui
    const bg = this.add.rectangle(0, 0, 280, 100, 0x000000, 0.5).setOrigin(0)
    this.markUIInteractive(bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 280, 100), Phaser.Geom.Rectangle.Contains))
    ui.add(bg)
    this.moneyText = this.add.text(12, 10, '', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' })
    this.waveText = this.add.text(12, 38, '', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
    this.baseText = this.add.text(12, 62, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })
    ui.add([this.moneyText, this.waveText, this.baseText])
  }
  updateHUD() {
    if(this.moneyText) this.moneyText.setText(`Money: ${this.money}`)
    if(this.waveText) this.waveText.setText(`Wave: ${this.wave}`)
    this.refreshUnitPickerUI?.()
  }
  updateBaseHUD() {
    this.baseText?.setText(`Base HP: ${Math.floor(this.baseHP)}/${this.baseMaxHP}`)
  }
  createUnitPickerUI() {
    const ui = this.add.container(0, 0).setScrollFactor(0).setDepth(999999)
    this.uiLayer.add(ui)
    this.unitPickerUI = ui
    const keys = ['knight', 'archer', 'monk']
    const btnW = 120, btnH = 40, pad = 10
    const panelW = pad*2 + keys.length*(btnW+pad) + (btnW+pad)
    const panelH = 60
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.5).setOrigin(0)
    this.markUIInteractive(bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, panelW, panelH), Phaser.Geom.Rectangle.Contains))
    ui.add(bg)
    this.pickerBtns = {}
    let x = pad
    keys.forEach((k) => {
        const u = UNITS[k]
        const r = this.add.rectangle(x, 10, btnW, btnH, 0x222222).setOrigin(0).setStrokeStyle(1, 0xaaaaaa)
        const t = this.add.text(x + btnW/2, 10 + btnH/2, `${u.label}\n${u.cost}`, { fontFamily: 'monospace', fontSize: '12px', align: 'center' }).setOrigin(0.5)
        const btn = this.markUIInteractive(r.setInteractive({ useHandCursor: true }))
        btn.on('pointerdown', (p) => { if(p.button===0) { this.selectedUnitKey = k; this.setPlaceMode('tower') } })
        ui.add([r, t])
        this.pickerBtns[k] = r
        x += btnW + pad
    })
    const rMine = this.add.rectangle(x, 10, btnW, btnH, 0x222222).setOrigin(0).setStrokeStyle(1, 0xaaaaaa)
    const tMine = this.add.text(x + btnW/2, 10 + btnH/2, `GoldMine\n80`, { fontFamily: 'monospace', fontSize: '12px', align: 'center' }).setOrigin(0.5)
    const btnMine = this.markUIInteractive(rMine.setInteractive({ useHandCursor: true }))
    btnMine.on('pointerdown', (p) => { if(p.button===0) this.setPlaceMode('GoldMine') })
    ui.add([rMine, tMine])
    this.pickerBtns['GoldMine'] = rMine
  }
  refreshUnitPickerUI() {
    if (!this.pickerBtns) return
    Object.keys(this.pickerBtns).forEach(k => {
        const btn = this.pickerBtns[k]
        let active = false
        if (k === 'GoldMine') active = (this.placeMode === 'GoldMine')
        else active = (this.placeMode === 'tower' && this.selectedUnitKey === k)
        btn.setStrokeStyle(active ? 3 : 1, active ? 0x00ff00 : 0xaaaaaa)
    })
  }
  selectGoldMine(mine) {
    if (!mine || !mine.active) return
    if (this.selectedMine === mine) return
    this.clearTowerSelection()
    this.clearMineSelection()
    this.selectedMine = mine
    this.mineSelectRing = this.add.circle(mine.x, mine.y, 32, 0xffd166, 0.2).setStrokeStyle(3, 0xffd166, 0.8).setDepth(5)
    this.createGoldMineUI(mine)
  }
  clearMineSelection() {
    this.selectedMine = null
    if (this.mineUI) { this.mineUI.destroy(true); this.mineUI = null }
    this.refreshMineUI = null
    if (this.mineSelectRing) { this.mineSelectRing.destroy(); this.mineSelectRing = null }
  }
  createGoldMineUI(mine) {
    const ui = this.add.container(0, 0).setScrollFactor(0).setDepth(999999)
    this.uiLayer.add(ui)
    this.mineUI = ui
    const panelW = 520, panelH = 120
    ui.setPosition(12, this.scale.height - panelH - 12)
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.85).setOrigin(0).setStrokeStyle(2, 0xffd166, 1)
    this.markUIInteractive(bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, panelW, panelH), Phaser.Geom.Rectangle.Contains))
    ui.add(bg)
    const title = this.add.text(16, 12, '', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff', fontStyle: 'bold' })
    const stats = this.add.text(16, 42, '', { fontFamily: 'monospace', fontSize: '16px', color: '#dddddd' })
    const extra = this.add.text(16, 68, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffd166' })
    ui.add([title, stats, extra])
    
    const createBtn = (x, y, w, h, label, color, onClick) => {
        const r = this.add.rectangle(x, y, w, h, color, 1).setOrigin(0).setStrokeStyle(1, 0xaaaaaa)
        const t = this.add.text(x + w/2, y + h/2, label, { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' }).setOrigin(0.5)
        const btn = this.markUIInteractive(r.setInteractive({ useHandCursor: true }))
        btn.on('pointerdown', (p) => { if(p.button===0) onClick() })
        ui.add([r, t])
        return { rect: r, text: t }
    }
    const btnUp = createBtn(16, 80, 240, 30, 'UPGRADE', 0x214a2f, () => this.handleMineUpgrade())
    const btnSell = createBtn(270, 80, 230, 30, 'SELL', 0x800000, () => this.sellSelectedMine())

    this.refreshMineUI = () => {
        if (!mine || !mine.active) { this.clearMineSelection(); return }
        title.setText(`GoldMine [Level ${mine.level}/${mine.maxLevel}]`)
        const perSec = mine.interval > 0 ? (mine.amount * (1000/mine.interval)).toFixed(1) : 0
        stats.setText(`Income: ${mine.amount}g / ${(mine.interval/1000).toFixed(1)}s (+${perSec}/sec)`)
        if (mine.canUpgrade && !mine.canUpgrade()) {
            extra.setText('MAX LEVEL')
            btnUp.text.setText('MAXED')
            btnUp.rect.setFillStyle(0x333333).disableInteractive()
        } else {
            const cost = mine.getUpgradeCost ? mine.getUpgradeCost() : 0
            extra.setText(`Next Level Cost: ${cost}g`)
            btnUp.text.setText(`UPGRADE (-${cost}g)`)
            if (this.money < cost) btnUp.rect.setFillStyle(0x555555).disableInteractive()
            else btnUp.rect.setFillStyle(0x214a2f).setInteractive({ useHandCursor: true })
        }
    }
    this.refreshMineUI()
  }
  handleMineUpgrade() {
      const m = this.selectedMine
      if (!m) return
      const cost = m.getUpgradeCost ? m.getUpgradeCost() : 100
      if (this.money < cost) { this.toast?.(`Need ${cost}`, m.x, m.y - 20); return }
      this.money -= cost
      if (m.upgrade) m.upgrade()
      this.updateHUD()
      this.toast?.('Mine Upgraded!', m.x, m.y - 20)
      this.refreshMineUI?.()
  }
  sellSelectedMine() {
      const m = this.selectedMine
      if (!m) return
      const refund = m.getSellRefund ? m.getSellRefund() : 50
      this.money += refund
      this.updateHUD()
      const { cx, cy } = this.worldToCell(m.x, m.y)
      this.occupiedCells.delete(this.cellKey(cx, cy))
      m.destroy()
      this.clearMineSelection()
      this.toast?.(`Sold for ${refund}g`, m.x, m.y)
  }
  handleTowerUpgrade() {
      const t = this.selectedTower
      if (t?.canUpgrade?.()) {
          const cost = t.getUpgradeCost()
          if (this.money >= cost) { this.money -= cost; t.upgrade(); this.updateHUD(); this.refreshTowerUI?.() }
          else this.toast?.(`Need ${cost}`, t.x, t.y - 20)
      }
  }
  selectTower(tower) {
    if (this.selectedTower === tower) return
    this.clearMineSelection()
    this.clearTowerSelection()
    this.selectedTower = tower
    // ✅ Range Circle Selection: สีเขียวสะท้อนแสง (0x39ff14)
    this.rangeCircle = this.add.circle(tower.x, tower.y, tower.range, 0x39ff14, 0.25).setStrokeStyle(2, 0x39ff14, 0.8).setDepth(5)
    this.createTowerUI(tower)
  }
  clearTowerSelection() {
    this.selectedTower = null
    if (this.rangeCircle) { this.rangeCircle.destroy(); this.rangeCircle = null }
    if (this.towerUI) { this.towerUI.destroy(true); this.towerUI = null }
    this.refreshTowerUI = null
  }
  sellSelectedTower() {
    const t = this.selectedTower
    if (!t) return
    const refund = t.getSellRefund ? t.getSellRefund() : 40
    this.money += refund
    this.updateHUD()
    const { cx, cy } = this.worldToCell(t.x, t.y)
    this.occupiedCells.delete(this.cellKey(cx, cy))
    t.destroy()
    this.clearTowerSelection()
  }
  createTowerUI(tower) {
    const ui = this.add.container(0, 0).setScrollFactor(0).setDepth(999999)
    this.uiLayer.add(ui)
    this.towerUI = ui
    const panelW = 520, panelH = 140
    ui.setPosition(12, this.scale.height - panelH - 12)
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.85).setOrigin(0).setStrokeStyle(2, 0x3399ff)
    this.markUIInteractive(bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, panelW, panelH), Phaser.Geom.Rectangle.Contains))
    ui.add(bg)
    const title = this.add.text(12, 10, '', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' })
    const stats = this.add.text(12, 34, '', { fontFamily: 'monospace', fontSize: '14px', color: '#dddddd' })
    const extra = this.add.text(12, 52, '', { fontFamily: 'monospace', fontSize: '14px', color: '#ffd166' })
    ui.add([title, stats, extra])

    const createBtn = (x, y, w, h, label, color, onClick) => {
        const r = this.add.rectangle(x, y, w, h, color, 1).setOrigin(0).setStrokeStyle(1, 0xaaaaaa)
        const t = this.add.text(x + w/2, y + h/2, label, { fontFamily: 'monospace', fontSize: '14px', color: '#ffffff' }).setOrigin(0.5)
        const btn = this.markUIInteractive(r.setInteractive({ useHandCursor: true }))
        btn.on('pointerdown', (p) => { if(p.button===0) onClick() })
        ui.add([r, t])
        return { rect: r, text: t }
    }
    const btnFirst = createBtn(12, 74, 120, 34, 'First', 0x1f3a6b, () => this.setSelectedTowerMode('first'))
    const btnFast = createBtn(150, 74, 120, 34, 'Fastest', 0x222222, () => this.setSelectedTowerMode('fastest'))
    const btnHP = createBtn(288, 74, 120, 34, 'High HP', 0x222222, () => this.setSelectedTowerMode('highestHP'))
    const btnUp = createBtn(12, 110, 246, 30, 'UPGRADE', 0x214a2f, () => this.handleTowerUpgrade())
    const btnSell = createBtn(274, 110, 234, 30, 'SELL', 0x800000, () => this.sellSelectedTower())

    this.refreshTowerUI = () => {
        if (!tower || !tower.active) { this.clearTowerSelection(); return }
        const unitName = tower.unitDef?.label ?? 'Tower'
        title.setText(`${unitName} [L${tower.level}/${tower.maxLevel}]`)
        const aps = tower.fireRate > 0 ? 1000 / tower.fireRate : 0
        stats.setText(`DMG ${tower.damage} | RNG ${tower.range} | AS ${aps.toFixed(2)}`)
        const setModeColor = (btn, on) => btn.rect.setFillStyle(on ? 0x2d62d9 : 0x222222)
        setModeColor(btnFirst, tower.targetMode === 'first')
        setModeColor(btnFast, tower.targetMode === 'fastest')
        setModeColor(btnHP, tower.targetMode === 'highestHP')
        if (!tower.canUpgrade()) {
            btnUp.text.setText('MAXED')
            btnUp.rect.setFillStyle(0x333333)
            extra.setText('MAX LEVEL')
        } else {
            const cost = tower.getUpgradeCost()
            btnUp.text.setText(`UPGRADE (-${cost})`)
            extra.setText(`Upgrade Cost: ${cost}`)
            btnUp.rect.setFillStyle(this.money >= cost ? 0x214a2f : 0x555555)
        }
    }
    this.refreshTowerUI()
  }
  setSelectedTowerMode(mode) {
      if (this.selectedTower) { this.selectedTower.targetMode = mode; this.refreshTowerUI?.() }
  }
  aliveEnemyCount() { return this.enemies.getChildren().filter(e => e.active && !e.isDead).length }
  onEnemyReachGoal(enemy) {
    if (this.isGameOver || !enemy || enemy.isDead) return
    enemy.isDead = true
    this.baseHP -= 50
    this.updateBaseHUD()
    enemy.destroy()
    this.cameras.main.shake(100, 0.01)
    if (this.baseHP <= 0) {
        this.isGameOver = true
        this.add.text(this.scale.width/2, this.scale.height/2, "GAME OVER", { fontSize: '64px', color: 'red' }).setOrigin(0.5).setScrollFactor(0)
    }
  }
  damageEnemy(enemy, dmg) {
      if (!enemy || !enemy.active) return
      enemy.hp -= dmg
      if (enemy.hp <= 0) {
          enemy.isDead = true
          this.money += 15
          this.updateHUD()
          enemy.destroy()
      }
  }
  toast(text, x, y) {
    const t = this.add.text(x, y, text, { fontSize: '14px', color: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5)
    this.tweens.add({ targets: t, y: y-30, alpha: 0, duration: 800, onComplete: () => t.destroy() })
  }
  createBossBar() {} 
  updateBossBar() {}
  layoutUI() {
    const w = this.scale.width
    const h = this.scale.height
    if (this.gameHUD) this.gameHUD.setPosition(10, 10)
    if (this.unitPickerUI) this.unitPickerUI.setPosition((w - this.unitPickerUI.list[0].width)/2, h - 80)
  }
}