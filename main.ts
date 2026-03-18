namespace SpriteKind {
    export const Snow = SpriteKind.create()
    export const Present = SpriteKind.create()
    export const Hint = SpriteKind.create()
}

let huntHintShownThisLevel = false
let huntHintSprite: Sprite = null

// ---------- PLAYER ART ----------

const playerIdle = img`
    . . . . . . f f . . . . f f . .
    . . . . . f 1 1 f . f 1 1 1 f .
    . . . . . f 3 3 f f 1 3 3 1 f .
    . . . . . f 3 3 f . f 1 3 1 f .
    . . . . . f 1 1 f f 1 1 f . . .
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

const playerRun1 = img`
    . . . . . . f f . . . . f f . .
    . . . . . f 1 1 f . f 1 1 1 f .
    . . . . . f 3 3 f f 1 3 3 1 f .
    . . . . . f 3 3 f . f 1 3 1 f .
    . . . . . f 1 1 f f 1 1 f . . .
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
    . . . . . . f f . . . . f f . .
    . . . . . f 1 1 f . f 1 1 1 f .
    . . . . . f 3 3 f f 1 3 3 1 f .
    . . . . . f 3 3 f . f 1 3 1 f .
    . . . . . f 1 1 f f 1 1 f . . .
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
    . . . . . . f f . . . . f f . .
    . . . . . f 1 1 f . f 1 1 1 f .
    . . . . . f 3 3 f f 1 3 3 1 f .
    . . . . . f 3 3 f . f 1 3 1 f .
    . . . . . f 1 1 f f 1 1 f . . .
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
const MAX_CANDY = 10

// shared snow image
const snowImg = image.create(2, 2)
snowImg.fill(1)

// ---------- GLOBAL STATE ----------

function requiredCandyForLevel(level: number) {
    return CANDY_TARGET_BASE + level * CANDY_TARGET_STEP
}

let currentLevel = 0
let levelCandyCollected = 0
let totalCandyCollected = 0
let isLevelTransition = false

let titlePage = 0
const TITLE_PAGE_COUNT = 3
let treeLightsOn = false

let timeLeft = TOTAL_TIME
let bg: Image = null
let title: Image = null
let mySprite: Sprite = null

let candyCaneSmall: Image = null

let startLoc: tiles.Location = null
let candyCount = 0
let gameStarted = false

// snow intensity
let frac = 0
let baseFlakes = 0
let bonusFlakes = 0
let totalFlakes = 0
let collected = 0

// player animation state
let facingLeft = false
let isRunning = false

let present: Sprite = null

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
    totalCandyCollected = 0
    currentLevel = 0
    gameStarted = true
    startLevel()
}

function startLevel() {
    // reset per-level counters
    candyCount = 0
    levelCandyCollected = 0
    timeLeft = TOTAL_TIME
    info.setScore(0)
    info.startCountdown(TOTAL_TIME)

    // reset per-level hint
    huntHintShownThisLevel = false
    if (huntHintSprite) {
        huntHintSprite.destroy()
        huntHintSprite = null
    }

    // clear old candy + present
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Present)
    present = null

    // background
    bg = image.create(160, 120)
    bg.fill(9)
    scene.setBackgroundImage(bg)

    // load tilemap
    tiles.setCurrentTilemap(LEVEL_TILEMAPS[currentLevel])
    effects.blizzard.startScreenEffect()

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
    for (let attempt = 0; attempt < 20; attempt++) {
        const col = randint(1, LEVEL_WIDTH - 2)
        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isTreeTile(spawnLoc)) {
                candidates.push(spawnLoc)
            }
        }

        if (candidates.length > 0) {
            return candidates[randint(0, candidates.length - 1)]
        }
    }
    return null
}

function spawnCandy() {
    if (!gameStarted || isLevelTransition) return
    if (candyCount >= MAX_CANDY) return

    const loc = findRandomPlatformSpawn()
    if (!loc) return

    const candy = sprites.create(candyCaneSmall, SpriteKind.Food)
    tiles.placeOnTile(candy, loc)
    candy.y -= 4
    candyCount++
}

// ---------- PRESENT HINT & SPAWN ----------

function showHuntPresentHint() {
    if (huntHintSprite) {
        huntHintSprite.destroy()
        huntHintSprite = null
    }

    const text = "Find the present!"
    const charW = 8
    const padding = 4

    const w = text.length * charW + padding * 2
    const h = 20

    const hintImg = image.create(w, h)
    hintImg.fill(2)
    hintImg.print(text, padding, 6, 7)

    huntHintSprite = sprites.create(hintImg, SpriteKind.Hint)
    huntHintSprite.setFlag(SpriteFlag.RelativeToCamera, true)
    huntHintSprite.x = 80
    huntHintSprite.y = 60
    huntHintSprite.lifespan = 1500
}

function maybeSpawnPresent() {
    if (!gameStarted || isLevelTransition) return
    if (present) return

    const target = requiredCandyForLevel(currentLevel)
    if (levelCandyCollected < target) return

    spawnPresent()
}

const MIN_PRESENT_DISTANCE_TILES = 3
const MAX_PRESENT_DISTANCE_TILES = 10

function findPlatformSpawnForPresent(): tiles.Location {
    if (!mySprite) return findRandomPlatformSpawn()

    const pCol = Math.idiv(mySprite.x, 16)
    const pRow = Math.idiv(mySprite.y, 16)

    // Phase 1: near player, but not too close
    for (let attempt = 0; attempt < 60; attempt++) {
        const leftCol = Math.max(1, pCol - MAX_PRESENT_DISTANCE_TILES)
        const rightCol = Math.min(LEVEL_WIDTH - 2, pCol + MAX_PRESENT_DISTANCE_TILES)
        const col = randint(leftCol, rightCol)

        const candidates: tiles.Location[] = []

        for (let r = 1; r <= GROUND_ROW; r++) {
            const belowLoc = tiles.getTileLocation(col, r)
            const spawnLoc = tiles.getTileLocation(col, r - 1)

            if (tiles.tileAtLocationIsWall(belowLoc)
                && !tiles.tileAtLocationIsWall(spawnLoc)
                && !isTreeTile(spawnLoc)) {

                const spawnRow = r - 1
                const tileDist =
                    Math.abs(col - pCol) + Math.abs(spawnRow - pRow)

                if (tileDist >= MIN_PRESENT_DISTANCE_TILES) {
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
                && !isTreeTile(spawnLoc)) {

                const spawnRow = r - 1
                const tileDist =
                    Math.abs(col - pCol) + Math.abs(spawnRow - pRow)

                if (tileDist >= MIN_PRESENT_DISTANCE_TILES) {
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

function spawnPresent() {
    if (present) {
        present.destroy()
        present = null
    }

    const spawnLoc = findPlatformSpawnForPresent()
    if (!spawnLoc) return

    present = sprites.create(presentImg, SpriteKind.Present)
    tiles.placeOnTile(present, spawnLoc)

    present.ay = 400
    present.setFlag(SpriteFlag.BounceOnWall, true)
    present.setFlag(SpriteFlag.GhostThroughWalls, false)
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

    // background: deep blue with "snow"
    title.fill(8)
    for (let i = 0; i < 40; i++) {
        const sx = randint(0, 159)
        const sy = randint(0, 119)
        title.setPixel(sx, sy, 1)
    }

    // big center sign
    const signX = 16
    const signY = 18
    const signW = 128
    const signH = 56

    title.fillRect(signX, signY, signW, signH, 1)
    title.drawRect(signX, signY, signW, signH, 8)

    // header text
    printCenteredInBox(title, "CODE NINJAS", signY + 8, 8, signX, signW)
    printCenteredInBox(title, "ORO VALLEY", signY + 20, 8, signX, signW)
    printCenteredInBox(title, "CANDY CANE RUN", signY + 32, 2, signX + 10, signW)
    printCenteredInBox(title, "Play it. Hack it.", signY + 44, 9, signX + 15, signW)

    if (titlePage == 0) {
        // PAGE 1: controls + icons
        printCenteredShadow(title, "A = Start", signY + signH + 8, 1)
        printCenteredShadow(title, "B = Info", signY + signH + 18, 1)

        const iconW = 40
        const iconH = 24
        const iconY = 90
        const paddingX = 6

        // left: candy cane
        const candyCardX = paddingX
        if (candyCaneSmall) {
            const cx = candyCardX + Math.idiv(iconW - candyCaneSmall.width, 2)
            const cy = iconY + Math.idiv(iconH - candyCaneSmall.height, 2)
            title.drawTransparentImage(candyCaneSmall, cx, cy)
        }

        // right: present
        const presentCardX = 160 - iconW - paddingX
        if (presentSmall) {
            const px = presentCardX + Math.idiv(iconW - presentSmall.width, 2)
            const py = iconY + Math.idiv(iconH - presentSmall.height, 2)
            title.drawTransparentImage(presentSmall, px, py)
        }

    } else if (titlePage == 1) {
        // PAGE 2: how to play
        printCenteredShadow(title, "HOW TO PLAY", 75, 5)
        title.print("A = jump", 12, 85, 5)
        title.print("\u2190/\u2192 = move", 1, 94, 5)
        title.print("Grab the candy canes!", 4, 105, 5)

    } else {
        // PAGE 3: URL / call to action
        printCenteredShadow(title, "VISIT US", 80, 1)
        printCenteredShadow(title, "codeninjas.com", 90, 1)
        printCenteredShadow(title, "/az-oro-valley", 100, 1)
        printCenteredShadow(title, "Press A to play", 110, 2)
    }

    scene.setBackgroundImage(title)
}

// ---------- GAME END ----------

function finishGameWithTotal(fromTimer: boolean) {
    gameStarted = false
    info.stopCountdown()
    effects.blizzard.endScreenEffect()

    const total = totalCandyCollected
    let header = fromTimer ? "Time's up!\n" : "Great job!\n"

    game.showLongText(
        "Come to the dojo and\n" +
        "show us your high score\n" +
        "to get a prize!",
        DialogLayout.Center
    )
    game.showLongText(
        header +
        "You collected " + total + " candy canes\n" +
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

    if (candyCount > 0) {
        candyCount--
    }

    levelCandyCollected++
    totalCandyCollected++

    const target = requiredCandyForLevel(currentLevel)
    if (!huntHintShownThisLevel && levelCandyCollected >= target) {
        huntHintShownThisLevel = true
        showHuntPresentHint()
    }

    maybeSpawnPresent()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Present, function (player, gift) {
    gift.destroy()
    present = null
    isLevelTransition = true

    info.stopCountdown()
    mySprite.vx = 0
    mySprite.vy = 0

    const levelNumber = currentLevel + 1
    const target = requiredCandyForLevel(currentLevel)
    const thisLevelCandy = levelCandyCollected

    const banner = sprites.create(image.create(140, 24), SpriteKind.Hint)
    banner.image.fill(0)
    banner.image.print("Level " + levelNumber + " complete!", 4, 4, 1)
    banner.image.print(thisLevelCandy + " / " + target + " candy", 4, 14, 1)
    banner.setFlag(SpriteFlag.RelativeToCamera, true)
    banner.x = 80
    banner.y = 60
    banner.lifespan = 3000

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

scene.onHitWall(SpriteKind.Snow, function (sprite, location) {
    if (sprite.lifespan > 250) {
        sprite.lifespan = 250
    }
})

// ---------- TILE HELPERS ----------

function isTreeTile(loc: tiles.Location) {
    return tiles.tileAtLocationEquals(loc, assets.tile`Tree`)
        || tiles.tileAtLocationEquals(loc, assets.tile`Tree2`)
}

// ---------- SNOW HELPERS ----------

function spawnSnowflakes(count: number) {
    const mapWidth = LEVEL_WIDTH * 16
    const mapHeight = (GROUND_ROW + 1) * 16
    const camY = scene.cameraProperty(CameraProperty.Y)

    // simple cap to avoid too many snow sprites
    const maxFlakes = 150
    const existing = sprites.allOfKind(SpriteKind.Snow).length
    if (existing >= maxFlakes) return

    const toSpawn = Math.min(count, maxFlakes - existing)

    for (let i = 0; i < toSpawn; i++) {
        const flake = sprites.create(snowImg, SpriteKind.Snow)

        flake.x = randint(0, mapWidth - 1)

        const layer = randint(0, 3)
        let yMin: number
        let yMax: number
        let vyMin: number
        let vyMax: number
        let ay: number

        if (layer == 0) {
            yMin = camY - 72
            yMax = camY - 40
            vyMin = 5
            vyMax = 12
            ay = 20
        } else if (layer == 1) {
            yMin = camY - 40
            yMax = camY - 10
            vyMin = 8
            vyMax = 16
            ay = 24
        } else if (layer == 2) {
            yMin = camY - 10
            yMax = camY + 20
            vyMin = 12
            vyMax = 22
            ay = 28
        } else {
            yMin = camY + 20
            yMax = camY + 60
            vyMin = 16
            vyMax = 26
            ay = 32
        }

        let ySpawn = randint(yMin, yMax)
        ySpawn = Math.max(0, Math.min(mapHeight - 1, ySpawn))
        flake.y = ySpawn

        flake.vx = randint(-20, 20)
        flake.vy = randint(vyMin, vyMax)
        flake.ay = ay

        flake.setFlag(SpriteFlag.GhostThroughWalls, false)
        flake.setFlag(SpriteFlag.AutoDestroy, false)
        flake.lifespan = 4000
    }
}

// ---------- PRESENT AI ----------

game.onUpdate(function () {
    if (!gameStarted || isLevelTransition || !present || !mySprite) return

    const dx = present.x - mySprite.x
    const dy = present.y - mySprite.y

    let dir = dx >= 0 ? 1 : -1

    const colHere = Math.idiv(present.x, 16)
    const rowHere = Math.idiv(present.y, 16)

    if (present.isHittingTile(CollisionDirection.Bottom)) {
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
                    present.vy = -220
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
                    present.vy = -220
                }
            }
        }
    }

    const runSpeed =
        currentLevel == 0 ? 60 :
            currentLevel == 1 ? 80 :
                currentLevel == 2 ? 110 : 140

    const targetVx = dir * runSpeed
    const accel = 20

    if (present.vx < targetVx) present.vx += accel
    if (present.vx > targetVx) present.vx -= accel

    const minX = 8
    const maxX = LEVEL_WIDTH * 16 - 8
    if (present.x < minX) {
        present.x = minX
        present.vx = Math.abs(present.vx)
    } else if (present.x > maxX) {
        present.x = maxX
        present.vx = -Math.abs(present.vx)
    }
})

// ---------- PLAYER ANIMATION UPDATE ----------

game.onUpdate(function () {
    if (!mySprite || !gameStarted || isLevelTransition) return

    const speed = mySprite.vx
    const moving = Math.abs(speed) > 10
    const grounded = mySprite.isHittingTile(CollisionDirection.Bottom)

    // decide facing based on movement
    let wantFacingLeft = facingLeft
    if (speed > 5) {
        wantFacingLeft = false
    } else if (speed < -5) {
        wantFacingLeft = true
    }

    const wantRun = moving && grounded

    if (wantRun) {
        // if we weren't running or changed direction, restart anim
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
        // go to idle
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
    effects.blizzard.endScreenEffect()

    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Snow)
    sprites.destroyAllSpritesOfKind(SpriteKind.Present)
    sprites.destroyAllSpritesOfKind(SpriteKind.Hint)
    tiles.setCurrentTilemap(tilemap`titleScreen`)

    mySprite = null
    present = null
    candyCount = 0
    timeLeft = TOTAL_TIME
    totalCandyCollected = 0
    levelCandyCollected = 0
    currentLevel = 0
    info.setScore(0)

    scene.cameraFollowSprite(null)
    scene.centerCameraAt(80, 60)

    titlePage = 0
    showTitleScreen()
}

// ---------- ART: CANDY / PRESENT ----------

const candyCaneBig = img`
    ......................... 
    .......1112221........... 
    ......111222111.......... 
    ......1112221111......... 
    .....22112211122......... 
    .....2221...1222......... 
    .....2222...2222......... 
    .....1122...2221......... 
    .....1111...2211......... 
    ......11....2111......... 
    .........7771112777...... 
    ........777771277777..... 
    ........77.777777.77..... 
    ........777.7447.777..... 
    .........7777777777...... 
    ..........77721777....... 
    ........777721117777..... 
    .......7777.1111.7777.... 
    .......277..1112..772.... 
    ........27..1122..72..... 
    ............1222......... 
    ............2222......... 
    ............2221......... 
    ............2211......... 
    ......................... 
`
candyCaneSmall = candyCaneBig

const presentImg = img`
    ................................
    ................................
    ................................
    ................................
    ................................
    ........7777777777777777........
    ........7....777777....7........
    ........7....777777....7........
    ........777777.77.777777........
    .....2222222222772222222222.....
    .....ffffffffff77ffffffffff.....
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......f221122117711221122f......
    ......fffffffff77fffffffff......
    ................................
    ................................
    ................................
    ................................
`
const presentSmall = presentImg

// ---------- BOOT ----------

resetToTitle()
isLevelTransition = false

// single 500 ms interval for candy, trees, and snow
game.onUpdateInterval(500, function () {
    // spawn candy (only during gameplay, see function guards)
    spawnCandy()

    if (!gameStarted) return

    // blink tree lights
    treeLightsOn = !treeLightsOn
    if (treeLightsOn) {
        for (let loc of tiles.getTilesByType(assets.tile`Tree`)) {
            tiles.setTileAt(loc, assets.tile`Tree2`)
        }
    } else {
        for (let loc of tiles.getTilesByType(assets.tile`Tree2`)) {
            tiles.setTileAt(loc, assets.tile`Tree`)
        }
    }

    // update snow intensity
    frac = info.countdown() / TOTAL_TIME
    if (frac > 0.66) {
        baseFlakes = 14
    } else if (frac > 0.33) {
        baseFlakes = 28
    } else {
        baseFlakes = 56
    }

    collected = info.score()
    bonusFlakes = Math.min(30, Math.idiv(collected, 3))
    totalFlakes = baseFlakes + bonusFlakes

    spawnSnowflakes(totalFlakes)
})
