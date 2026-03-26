namespace SpriteKind {
    export const Butterfly = SpriteKind.create()
    export const EasterEgg = SpriteKind.create()
    export const Hint = SpriteKind.create()
}

let huntHintShownThisLevel = false
let huntHintSprite: Sprite = null

// ---------- PLAYER ART ----------

const playerIdle = img`
    . . . . . f f . . . f f . . . .
    . . . . f 1 1 f . f 1 1 f . . .
    . . . . f 3 1 f . f 1 3 f . . .
    . . . . f 3 1 f . f 1 3 f . . .
    . . . . f 3 1 f . f 1 3 f . . .
    . . . f f f f f f f f f f . . .
    . . f f f f f f f f f f f f . .
    . f f f d d d d d d d d f f f .
    . f f d d f d d d f d d d f f .
    . . f f d d d d d d d d f f . .
    . . . f f f f f f f f f f . . .
    . . f f 8 8 8 8 8 8 8 8 f f . .
    . . f f f f f f f f f f f f . .
    . . . f f f . . . . f f f . . .
    . . f f f . . . . . . f f f . .
    . . . . . . . . . . . . . . . .
`

const playerRun1 = img`
    . . . . . f f . . . . . f f . .
    . . . . f 1 1 f . . . f 1 1 f .
    . . . . f 1 3 f . . f 1 3 1 f .
    . . . . f 1 3 f . f 1 3 1 f . .
    . . . . f 1 3 f . f 3 1 f . . .
    . . . f f f f f f f f f f . . .
    . . f f f f f f f f f f f f . .
    . . f f d d d d d d d d f f . .
    . . f d d f d d d f d d d f . .
    . . f f d d d d d d d d f f . .
    . . . f f f f f f f f f f . . .
    . . f f 8 8 8 8 8 8 8 8 f f . .
    . . f f f f f f f f f f f f . .
    . . . f f f . . . . f f . . . .
    . . . . f f . . . . . f f . . .
    . . . . . . . . . . . . . . . .
`

const playerRun2 = img`
    . . . . . f f . . . . . f f . .
    . . . . f 1 1 f . . . f 1 1 f .
    . . . . f 1 3 f . . f 1 3 1 f .
    . . . . f 1 3 f . f 1 3 1 f . .
    . . . . f 1 3 f . f 3 1 f . . .
    . . . f f f f f f f f f f . . .
    . . f f f f f f f f f f f f . .
    . . f f d d d d d d d d f f . .
    . . f d d f d d d f d d d f . .
    . . f f d d d d d d d d f f . .
    . . . f f f f f f f f f f . . .
    . . f f 8 8 8 8 8 8 8 8 f f . .
    . . f f f f f f f f f f f f . .
    . . . f f f . . . . f f f . . .
    . . . f f . . . . . . f f . . .
    . . . . . . . . . . . . . . . .
`

const playerRun3 = img`
    . . . . . f f . . . . . f f . .
    . . . . f 1 1 f . . . f 1 1 f .
    . . . . f 1 3 f . . f 1 3 1 f .
    . . . . f 1 3 f . f 1 3 1 f . .
    . . . . f 1 3 f . f 3 1 f . . .
    . . . f f f f f f f f f f . . .
    . . f f f f f f f f f f f f . .
    . . f f d d d d d d d d f f . .
    . . f d d f d d d f d d d f . .
    . . f f d d d d d d d d f f . .
    . . . f f f f f f f f f f . . .
    . . f f 8 8 8 8 8 8 8 8 f f . .
    . . f f f f f f f f f f f f . .
    . . . . f f f . . . . f f f . .
    . . . . f f . . . . . . f f . .
    . . . . . . . . . . . . . . . .
`

// Right-facing versions (original art is looking LEFT)
const playerIdleRight = playerIdle.clone()
playerIdleRight.flipX()
const playerRunRight: Image[] = [
    playerRun1.clone(),
    playerRun2.clone(),
    playerRun3.clone()
]
for (let frame of playerRunRight) {
    frame.flipX()
}

// Left-facing versions (originals)
const playerIdleLeft = playerIdle
const playerRunLeft: Image[] = [playerRun1, playerRun2, playerRun3]

// ---------- CONFIG ----------

const LEVEL_TILEMAPS = [
    tilemap`level1`,
    tilemap`level2`,
    tilemap`level3`,
    tilemap`level4`
]

const CANDY_TARGET_BASE = 50
const CANDY_TARGET_STEP = 15

const TOTAL_TIME = 80
const LEVEL_WIDTH = 32
const GROUND_ROW = 15
const MAX_EGGS = 10

// ---------- BUTTERFLY ART ----------
// Two wing frames for a flapping animation — 8x6 sprites
// Frame 1: wings up
const butterflyA = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . e . e . . . . . . .
    . . f f f . e e e . f f f . . .
    . . f a 3 f . e . f 3 a f . . .
    . . f 3 1 3 f e f 3 1 3 f . . .
    . . f 3 3 a 3 e 3 a 3 3 f . . .
    . . . f 3 3 1 e 1 3 3 f . . . .
    . . . . f f 3 e 3 f f . . . . .
    . . . f 3 a 3 e 3 a 3 f . . . .
    . . . f a 3 f e f 3 a f . . . .
    . . . . f f . e . f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`
// Frame 2: wings mid (slightly lower)
const butterflyB = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . e . e . . . . . . .
    . . . . f . e e e . f . . . . .
    . . . . f f . e . f f . . . . .
    . . . . f 3 f e f 3 f . . . . .
    . . . . f a 3 e 3 a f . . . . .
    . . . . f 3 1 e 1 3 f . . . . .
    . . . . f f 3 e 3 f f . . . . .
    . . . . f a 3 e 3 a f . . . . .
    . . . . f 3 f e f 3 f . . . . .
    . . . . f f . e . f f . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`

// Butterfly color variants — index maps to which color to tint
// We'll just use different pre-colored frames for variety
const butterflyColors = [
    [9, 7],   // blue / yellow
    [13, 5],  // pink / yellow
    [10, 7],  // green / yellow
    [8, 5],   // purple / yellow
]

// ---------- GLOBAL STATE ----------

function requiredEggsForLevel(level: number) {
    return CANDY_TARGET_BASE + level * CANDY_TARGET_STEP
}

let currentLevel = 0
let levelEggsCollected = 0
let totalEggsCollected = 0
let isLevelTransition = false

let titlePage = 0
const TITLE_PAGE_COUNT = 3
let flowerToggle = false

let timeLeft = TOTAL_TIME
let bg: Image = null
let title: Image = null
let mySprite: Sprite = null

let eggSmall: Image = null

let startLoc: tiles.Location = null
let eggCount = 0
let gameStarted = false

// butterfly intensity
let frac = 0
let baseButterflies = 0
let bonusButterflies = 0
let totalButterflies = 0
let collected = 0

// player animation state
let facingLeft = false
let isRunning = false

let bunny: Sprite = null

// ---------- CONTROLS ----------

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameStarted) return
    titlePage = (titlePage + 1) % TITLE_PAGE_COUNT
    showTitleScreen()
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!gameStarted) {
        startGame()
        return
    }
    if (mySprite && mySprite.isHittingTile(CollisionDirection.Bottom)) {
        mySprite.vy = -220
    }
})

// ---------- GAME FLOW ----------

function startGame() {
    totalEggsCollected = 0
    currentLevel = 0
    gameStarted = true
    startLevel()
}

function startLevel() {
    // reset per-level counters
    eggCount = 0
    levelEggsCollected = 0
    timeLeft = TOTAL_TIME
    info.setScore(0)
    info.startCountdown(TOTAL_TIME)

    // reset per-level hint
    huntHintShownThisLevel = false
    if (huntHintSprite) {
        huntHintSprite.destroy()
        huntHintSprite = null
    }

    // clear old eggs + bunny
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.EasterEgg)
    bunny = null

    // background — light spring sky
    bg = image.create(160, 120)
    bg.fill(9)
    scene.setBackgroundImage(bg)

    // load tilemap
    tiles.setCurrentTilemap(LEVEL_TILEMAPS[currentLevel])

    // create player once, reuse later
    if (!mySprite) {
        mySprite = sprites.create(playerIdleRight, SpriteKind.Player)
        mySprite.ay = 400
        controller.moveSprite(mySprite, 100, 0)
        scene.cameraFollowSprite(mySprite)
    } else {
        mySprite.setImage(playerIdleRight)
        mySprite.ay = 400
    }

    facingLeft = false
    isRunning = false

    // place player
    startLoc = tiles.getTileLocation(1, GROUND_ROW - 1)
    tiles.placeOnTile(mySprite, startLoc)
    mySprite.vx = 0
    mySprite.vy = 0
}

// ---------- SPAWN HELPERS ----------

function findRandomPlatformSpawn(): tiles.Location {
    for (let attempt = 0; attempt < 40; attempt++) {
        const col = randint(1, LEVEL_WIDTH - 2)
        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isFlowerTile(spawnLoc)) {
                candidates.push(spawnLoc)
            }
        }

        if (candidates.length > 0) {
            return candidates[randint(0, candidates.length - 1)]
        }
    }

    // fallback: scan every column in order
    for (let col = 1; col <= LEVEL_WIDTH - 2; col++) {
        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isFlowerTile(spawnLoc)) {
                candidates.push(spawnLoc)
            }
        }

        if (candidates.length > 0) {
            return candidates[randint(0, candidates.length - 1)]
        }
    }

    return null
}

function spawnEgg() {
    if (!gameStarted || isLevelTransition) return
    if (eggCount >= MAX_EGGS) return

    const loc = findRandomPlatformSpawn()
    if (!loc) return

    const egg = sprites.create(eggSmall, SpriteKind.Food)
    tiles.placeOnTile(egg, loc)
    egg.y -= 4
    eggCount++
}

// ---------- BUNNY HINT & SPAWN ----------

function showHuntBunnyHint() {
    if (huntHintSprite) {
        huntHintSprite.destroy()
        huntHintSprite = null
    }

    const text = "Find the Easter Bunny!"
    const charW = 8
    const padding = 4

    const w = text.length * charW + padding * 2
    const h = 20

    const hintImg = image.create(w, h)
    hintImg.fill(10)            // green banner — spring feel
    hintImg.print(text, padding, 6, 1)

    huntHintSprite = sprites.create(hintImg, SpriteKind.Hint)
    huntHintSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    huntHintSprite.x = 80
    huntHintSprite.y = 60
    huntHintSprite.lifespan = 1500
}

function maybeSpawnBunny() {
    if (!gameStarted || isLevelTransition) return
    if (bunny) return

    const target = requiredEggsForLevel(currentLevel)
    if (levelEggsCollected < target) return

    spawnBunny()
}

const MIN_BUNNY_DISTANCE_TILES = 3
const MAX_BUNNY_DISTANCE_TILES = 10

function findPlatformSpawnForBunny(): tiles.Location {
    if (!mySprite) return findRandomPlatformSpawn()

    const pCol = Math.idiv(mySprite.x, 16)
    const pRow = Math.idiv(mySprite.y, 16)

    // Phase 1: near player, but not too close
    for (let attempt = 0; attempt < 60; attempt++) {
        const leftCol = Math.max(1, pCol - MAX_BUNNY_DISTANCE_TILES)
        const rightCol = Math.min(LEVEL_WIDTH - 2, pCol + MAX_BUNNY_DISTANCE_TILES)
        const col = randint(leftCol, rightCol)

        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isFlowerTile(spawnLoc)) {

                const spawnRow = r - 1
                const tileDist =
                    Math.abs(col - pCol) + Math.abs(spawnRow - pRow)

                if (tileDist >= MIN_BUNNY_DISTANCE_TILES) {
                    candidates.push(spawnLoc)
                }
            }
        }

        if (candidates.length > 0) {
            return candidates[randint(0, candidates.length - 1)]
        }
    }

    // Phase 2: whole map fallback
    for (let attempt = 0; attempt < 80; attempt++) {
        const col = randint(1, LEVEL_WIDTH - 2)
        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isFlowerTile(spawnLoc)) {

                const spawnRow = r - 1
                const tileDist =
                    Math.abs(col - pCol) + Math.abs(spawnRow - pRow)

                if (tileDist >= MIN_BUNNY_DISTANCE_TILES) {
                    candidates.push(spawnLoc)
                }
            }
        }

        if (candidates.length > 0) {
            return candidates[randint(0, candidates.length - 1)]
        }
    }

    return findRandomPlatformSpawn()
}

function spawnBunny() {
    if (bunny) {
        bunny.destroy()
        bunny = null
    }

    const spawnLoc = findPlatformSpawnForBunny()
    if (!spawnLoc) return

    bunny = sprites.create(bunnyImg, SpriteKind.EasterEgg)
    tiles.placeOnTile(bunny, spawnLoc)

    bunny.ay = 400
    bunny.setFlag(SpriteFlag.GhostThroughWalls, false)

    // confetti only while the bunny is on the loose!
    effects.confetti.startScreenEffect()
}

// ---------- TITLE SCREEN ----------

function printCenteredInBox(
    img: Image,
    text: string,
    y: number,
    color: number,
    boxX: number,
    boxW: number
) {
    const charWidth = 8
    const w = text.length * charWidth
    const x = boxX + Math.idiv(boxW - w, 2)
    img.print(text, x, y, color)
}

function printCenteredShadow(
    img: Image,
    text: string,
    y: number,
    color: number
) {
    const charWidth = 8
    const w = text.length * charWidth
    const x = Math.idiv(img.width - w, 2)
    img.print(text, x, y, color)
}

function showTitleScreen() {
    title = image.create(160, 120)

    // background: light spring sky with scattered butterflies
    title.fill(9)
    for (let i = 0; i < 40; i++) {
        const sx = randint(0, 159)
        const sy = randint(0, 119)
        title.setPixel(sx, sy, 13)   // spring color dots
    }

    // big center sign
    const signX = 16
    const signY = 18
    const signW = 128
    const signH = 56

    title.fillRect(signX, signY, signW, signH, 10)   // spring green
    title.drawRect(signX, signY, signW, signH, 7)    // white border

    // header text
    printCenteredInBox(title, "CODE NINJAS", signY + 8, 7, signX, signW)
    printCenteredInBox(title, "ORO VALLEY", signY + 20, 7, signX, signW)
    printCenteredInBox(title, "EGG HUNT", signY + 32, 5, signX + 10, signW)
    printCenteredInBox(title, "Play it. Hack it.", signY + 44, 1, signX + 15, signW)

    if (titlePage == 0) {
        // PAGE 1: controls + icons
        printCenteredShadow(title, "A = Start", signY + signH + 8, 1)
        printCenteredShadow(title, "B = Info", signY + signH + 18, 1)

        const iconW = 40
        const iconH = 24
        const iconY = 90
        const paddingX = 6

        // left: Easter egg
        const eggCardX = paddingX
        if (eggSmall) {
            const cx = eggCardX + Math.idiv(iconW - eggSmall.width, 2)
            const cy = iconY + Math.idiv(iconH - eggSmall.height, 2)
            title.drawTransparentImage(eggSmall, cx, cy)
        }

        // right: bunny
        const bunnyCardX = 160 - iconW - paddingX
        if (bunnySmall) {
            const px = bunnyCardX + Math.idiv(iconW - bunnySmall.width, 2)
            const py = iconY + Math.idiv(iconH - bunnySmall.height, 2)
            title.drawTransparentImage(bunnySmall, px, py)
        }

    } else if (titlePage == 1) {
        // PAGE 2: how to play
        printCenteredShadow(title, "HOW TO PLAY", 75, 5)
        title.print("A = jump", 12, 85, 5)
        title.print("\u2190/\u2192 = move", 1, 94, 5)
        title.print("Grab the Easter eggs!", 4, 105, 5)

    } else {
        // PAGE 3: URL / call to action
        printCenteredShadow(title, "VISIT US", 80, 1)
        printCenteredShadow(title, "codeninjas.com", 90, 1)
        printCenteredShadow(title, "/az-oro-valley", 100, 1)
        printCenteredShadow(title, "Press A to play", 110, 5)
    }

    scene.setBackgroundImage(title)
}

// ---------- GAME END ----------

function finishGameWithTotal(fromTimer: boolean) {
    gameStarted = false
    info.stopCountdown()
    effects.confetti.endScreenEffect()

    const total = totalEggsCollected
    let header = fromTimer ? "Time's up!\n" : "Great job!\n"

    game.showLongText(
        "Come to the dojo and\n" +
        "show us your high score\n" +
        "to get a prize!",
        DialogLayout.Center
    )
    game.showLongText(
        header +
        "You collected " + total + " eggs\n" +
        "across all levels!",
        DialogLayout.Center
    )
    game.showLongText(
        "Want to learn how to\n" +
        "change this game and\n" +
        "make your OWN games?",
        DialogLayout.Center
    )
    game.showLongText(
        "Visit\n" +
        "codeninjas.com/\n" +
        "az-oro-valley",
        DialogLayout.Center
    )

    resetToTitle()
}

info.onCountdownEnd(function () {
    if (!gameStarted) return
    finishGameWithTotal(true)
})

// ---------- COLLISIONS ----------

sprites.onOverlap(SpriteKind.Food, SpriteKind.Player, function (sprite, otherSprite) {
    if (!gameStarted || isLevelTransition) return

    sprite.destroy()
    info.changeScoreBy(1)

    if (eggCount > 0) {
        eggCount--
    }

    levelEggsCollected++
    totalEggsCollected++

    const target = requiredEggsForLevel(currentLevel)
    if (!huntHintShownThisLevel && levelEggsCollected >= target) {
        huntHintShownThisLevel = true
        showHuntBunnyHint()
    }

    maybeSpawnBunny()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.EasterEgg, function (player, gift) {
    gift.destroy()
    bunny = null
    isLevelTransition = true

    effects.confetti.endScreenEffect()   // bunny caught — confetti stops
    info.stopCountdown()
    mySprite.vx = 0
    mySprite.vy = 0

    const levelNumber = currentLevel + 1
    const target = requiredEggsForLevel(currentLevel)
    const thisLevelEggs = levelEggsCollected

    const banner = sprites.create(image.create(140, 24), SpriteKind.Hint)
    banner.image.fill(0)
    banner.image.print("Level " + levelNumber + " complete!", 4, 4, 10)
    banner.image.print(thisLevelEggs + " / " + target + " eggs", 4, 14, 13)
    banner.setFlag(SpriteFlag.RelativeToCamera, true)
    banner.x = 80
    banner.y = 60
    banner.lifespan = 3200

    music.baDing.play()
    pause(3200)

    currentLevel++

    if (currentLevel >= LEVEL_TILEMAPS.length) {
        finishGameWithTotal(false)
    } else {
        isLevelTransition = false
        startLevel()
    }
})

scene.onHitWall(SpriteKind.Butterfly, function (sprite, location) {
    if (sprite.lifespan > 250) {
        sprite.lifespan = 250
    }
})

// ---------- TILE HELPERS ----------

function isFlowerTile(loc: tiles.Location) {
    return tiles.tileAtLocationEquals(loc, assets.tile`Flower`)
        || tiles.tileAtLocationEquals(loc, assets.tile`Flower2`)
}

// ---------- BUTTERFLY HELPERS ----------

function spawnButterflies(count: number) {
    const mapWidth = LEVEL_WIDTH * 16
    const mapHeight = (GROUND_ROW + 1) * 16
    const camX = scene.cameraProperty(CameraProperty.X)
    const camY = scene.cameraProperty(CameraProperty.Y)

    // Keep butterfly count gentle — max 30 on screen at once
    const maxButterflies = 30
    const existing = sprites.allOfKind(SpriteKind.Butterfly).length
    if (existing >= maxButterflies) return

    const toSpawn = Math.min(count, maxButterflies - existing)

    for (let i = 0; i < toSpawn; i++) {
        // Pick a random color pair from our palette
        const colorPair = butterflyColors[randint(0, 3)]
        const wingColor = colorPair[0]
        const bodyColor = colorPair[1]

        // Build a colored frame A and frame B for this butterfly
        const fA = butterflyA.clone()
        const fB = butterflyB.clone()

        // Re-color: replace template colors (9=wing, 7=detail, d=body)
        for (let px = 0; px < fA.width; px++) {
            for (let py = 0; py < fA.height; py++) {
                const c = fA.getPixel(px, py)
                if (c == 9) { fA.setPixel(px, py, wingColor) }
                else if (c == 7) { fA.setPixel(px, py, bodyColor) }
            }
        }
        for (let px = 0; px < fB.width; px++) {
            for (let py = 0; py < fB.height; py++) {
                const c = fB.getPixel(px, py)
                if (c == 9) { fB.setPixel(px, py, wingColor) }
                else if (c == 7) { fB.setPixel(px, py, bodyColor) }
            }
        }

        // Spawn just off the left or right edge of the visible screen
        const spawnFromLeft = Math.percentChance(50)
        const butterfly = sprites.create(fA, SpriteKind.Butterfly)

        // Horizontal: enter from one side, drift gently across
        if (spawnFromLeft) {
            butterfly.x = camX - 80 + randint(-20, 0)
            butterfly.vx = randint(18, 35)
        } else {
            butterfly.x = camX + 80 + randint(0, 20)
            butterfly.vx = -randint(18, 35)
        }

        // Vertical: spread across the visible play area
        butterfly.y = camY + randint(-50, 50)
        // Gentle vertical bob — butterflies don't fall, they float
        butterfly.vy = randint(-8, 8)
        butterfly.ay = 0   // no gravity for butterflies

        butterfly.setFlag(SpriteFlag.GhostThroughWalls, true)
        butterfly.setFlag(SpriteFlag.AutoDestroy, true)
        butterfly.lifespan = randint(5000, 9000)

        // Wing-flap animation: alternate between frame A and B
        animation.runImageAnimation(butterfly, [fA, fB], 180, true)
    }
}

// ---------- BUNNY AI ----------

game.onUpdate(function () {
    if (!gameStarted || isLevelTransition || !bunny || !mySprite) return

    const dx = bunny.x - mySprite.x
    const dy = bunny.y - mySprite.y

    let dir = dx >= 0 ? 1 : -1

    const colHere = Math.idiv(bunny.x, 16)
    const rowHere = Math.idiv(bunny.y, 16)

    if (bunny.isHittingTile(CollisionDirection.Bottom)) {
        let aheadCol = colHere + dir

        if (aheadCol < 1 || aheadCol > LEVEL_WIDTH - 2) {
            dir *= -1
        } else {
            let belowAheadRow = rowHere + 1
            if (belowAheadRow > GROUND_ROW) belowAheadRow = GROUND_ROW

            const belowAhead = tiles.getTileLocation(aheadCol, belowAheadRow)
            const groundAhead = tiles.tileAtLocationIsWall(belowAhead)

            if (!groundAhead) {
                const jumpChance =
                    currentLevel == 0 ? 0 :
                        currentLevel == 1 ? 30 :
                            currentLevel == 2 ? 60 : 85

                if (Math.percentChance(jumpChance)) {
                    bunny.vy = -220
                } else {
                    dir *= -1
                }
            } else {
                const horizDist = Math.abs(dx)
                const vertDist = Math.abs(dy)
                if (
                    currentLevel >= 2 &&
                    horizDist < 40 &&
                    vertDist < 32 &&
                    Math.percentChance(20 + currentLevel * 5)
                ) {
                    bunny.vy = -220
                }
            }
        }
    }

    const runSpeed =
        currentLevel == 0 ? 60 :
            currentLevel == 1 ? 80 :
                currentLevel == 2 ? 110 : 140

    const targetVx = dir * runSpeed
    bunny.vx += (targetVx - bunny.vx) * 0.25

    const minX = 8
    const maxX = LEVEL_WIDTH * 16 - 8
    if (bunny.x < minX) {
        bunny.x = minX
        bunny.vx = Math.abs(bunny.vx)
    } else if (bunny.x > maxX) {
        bunny.x = maxX
        bunny.vx = -Math.abs(bunny.vx)
    }
})

// ---------- PLAYER ANIMATION UPDATE ----------

game.onUpdate(function () {
    if (!mySprite || !gameStarted || isLevelTransition) return

    const speed = mySprite.vx
    const moving = Math.abs(speed) > 10
    const grounded = mySprite.isHittingTile(CollisionDirection.Bottom)

    let wantFacingLeft = facingLeft
    if (speed > 5) {
        wantFacingLeft = false
    } else if (speed < -5) {
        wantFacingLeft = true
    }

    const wantRun = moving && grounded

    if (wantRun) {
        if (!isRunning || wantFacingLeft != facingLeft) {
            isRunning = true
            facingLeft = wantFacingLeft
            animation.runImageAnimation(
                mySprite,
                facingLeft ? playerRunLeft : playerRunRight,
                100,
                true
            )
        }
    } else {
        if (isRunning) {
            animation.stopAnimation(animation.AnimationTypes.All, mySprite)
            isRunning = false
        }
        facingLeft = wantFacingLeft
        mySprite.setImage(facingLeft ? playerIdleLeft : playerIdleRight)
    }
})

// ---------- RESET TO TITLE ----------

function resetToTitle() {
    gameStarted = false

    info.stopCountdown()
    effects.confetti.endScreenEffect()

    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Butterfly)
    sprites.destroyAllSpritesOfKind(SpriteKind.EasterEgg)
    sprites.destroyAllSpritesOfKind(SpriteKind.Hint)
    tiles.setCurrentTilemap(tilemap`titleScreen`)

    mySprite = null
    bunny = null
    eggCount = 0
    timeLeft = TOTAL_TIME
    totalEggsCollected = 0
    levelEggsCollected = 0
    currentLevel = 0
    info.setScore(0)

    scene.cameraFollowSprite(null)
    scene.centerCameraAt(80, 60)

    titlePage = 0
    showTitleScreen()
}

// ---------- ART: EASTER EGG / BUNNY ----------

// Easter egg — colorful oval with stripe decoration
const eggBig = img`
    . . . . . . . f f . . . . . . .
    . . . . . . f 4 4 f . . . . . .
    . . . . . f 4 4 4 4 f . . . . .
    . . . . f d 1 4 4 1 d f . . . .
    . . . f d d d 1 1 d d d f . . .
    . . f 4 1 1 d d d d 1 1 4 f . .
    . . f 4 4 4 1 1 1 1 4 4 4 f . .
    . f 1 1 4 4 4 4 4 4 4 4 1 1 f .
    . f d d 1 1 4 4 4 4 1 1 d d f .
    . f d d d d 1 1 1 1 d d d d f .
    . f d d d d d d d d d d d d f .
    . f 1 1 d d d d d d d d 1 1 f .
    . . f 4 1 1 d d d d 1 1 4 f . .
    . . . f 4 4 1 1 1 1 4 4 f . . .
    . . . . f 4 4 4 4 4 4 f . . . .
    . . . . . f f f f f f . . . . .
`
eggSmall = eggBig.clone()

// Easter Bunny — white bunny with pink ears
const bunnyImg = img`
    ......eeee..........eeee........
    ......e33ee........ee33e........
    .......e33ee......ee33e.........
    ........e33ee....ee33e..........
    .........e33e....e33e...........
    ..........e33eeee33e............
    ...........eeeeeeee.............
    ...........eeeeeeee.............
    ...........e11ee11e.............
    ...........effeeffe.............
    ...........44e33e44.............
    ..........4444334444............
    ..........4444114444............
    ...........4444a444.............
    .............e44e...............
    ..........eee4444eee............
    ........eeee444444eeee..........
    .......eeeee444444eeeee.........
    .......e3e.44444444.e3e11.......
    .......eee.444444441eee.11......
    ...........444444441.6.8.1......
    ..........e4444444413795a1......
    .........eee444444e1111111......
    .........eeee4444ee1111111......
    .........eeeeeeeeee1111111......
    ..........eee.....ee11111.......
    ...........eee...eee............
    .........eeeee...eeeee..........
    ................................
    ................................
    ................................
    ................................
`
const bunnySmall = bunnyImg.clone()

// ---------- BOOT ----------

resetToTitle()
isLevelTransition = false

// single 500 ms interval for eggs, flowers, and butterflies
game.onUpdateInterval(500, function () {
    // spawn Easter eggs (only during gameplay)
    spawnEgg()

    if (!gameStarted) return

    // retry bunny spawn if target reached but bunny not yet created
    maybeSpawnBunny()

    // blink spring flowers
    flowerToggle = !flowerToggle
    if (flowerToggle) {
        for (let loc of tiles.getTilesByType(assets.tile`Flower`)) {
            tiles.setTileAt(loc, assets.tile`Flower2`)
        }
    } else {
        for (let loc of tiles.getTilesByType(assets.tile`Flower2`)) {
            tiles.setTileAt(loc, assets.tile`Flower`)
        }
    }

    // update butterfly count — stays gentle throughout, small bonus for eggs collected
    frac = info.countdown() / TOTAL_TIME
    if (frac > 0.66) {
        baseButterflies = 1
    } else if (frac > 0.33) {
        baseButterflies = 2
    } else {
        baseButterflies = 3
    }

    collected = info.score()
    bonusButterflies = Math.min(3, Math.idiv(collected, 15))
    totalButterflies = baseButterflies + bonusButterflies

    spawnButterflies(totalButterflies)
})