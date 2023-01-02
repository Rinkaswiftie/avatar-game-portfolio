const canvas = document.getElementById('background')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const GRAVITY = 0.4;
const PIT_GAP = 300
const PLAYER_SPEED = 10
const BACKGROUND_SPEED = 3
const PLATFORM_COUNT = 5
const BACKGROUND_COUNT = 3

let player = undefined;
let platforms = [];
let backGrounds = []
let scrollOffset = 0;

let keys = {}

function createImage(src, width, height) {
    const image = new Image()
    image.src = src
    image.width = width
    image.height = height
    return image;
}

const floorImage = createImage("assets/floor.png", 300, 100)
const background = createImage("assets/background.png", window.innerWidth, window.innerHeight);
const spriteStandRight = createImage("assets/sprite.png", 300, 50);
const spriteStandLeft = createImage("assets/sprite-left.png", 300, 50);

class Player {

    constructor() {
        this.position = {
            x: window.innerWidth * 0.10,
            y: 0
        }
        this.speed = {
            x: 1,
            y: 1
        }
        this.width = 200
        this.height = 200
        this.img = spriteStandRight
    }

    draw() {
        c.drawImage(this.img, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.y += this.speed.y;
        this.position.x += this.speed.x;
        if (this.position.y + this.height + this.speed.y <= canvas.height)
            this.speed.y += GRAVITY; // to accelerate with gravity
        this.draw();
    }
}

class Platform {
    constructor(x, y) {
        this.position = {
            x: x,
            y: y
        }
        this.width = floorImage.width
        this.height = floorImage.height
    }

    draw() {
        c.drawImage(floorImage, this.position.x, this.position.y);
    }
}

class Background {
    constructor(x, y) {
        this.position = {
            x: x,
            y: y
        }
        this.width = background.width
        this.height = background.height
    }

    draw() {
        c.drawImage(background, this.position.x, this.position.y, this.width, this.height);
    }
}

function animate() {
    //todo: read about this
    requestAnimationFrame(animate);
    //Reset the canvas
    c.clearRect(0, 0, canvas.width, canvas.height)
    //paint the background first
    backGrounds.forEach(r => r.draw())
    platforms.forEach(f => f.draw());
    player.update();

    const lastPlatForm = (floorImage.width * 2 * PLATFORM_COUNT) + ((PLATFORM_COUNT - 1) * PIT_GAP)
    console.log(lastPlatForm)
    const isPlayerMovingOnScreen1 = keys.left.pressed && scrollOffset === 0 && player.position.x > 0
    const playerReachedRightLimit = scrollOffset < -1 * (lastPlatForm)
    //player should move only until 1/6th of the screen in the right and 1/10th of the screen in the left
    if (keys.right.pressed && player.position.x < window.innerWidth * 0.60) player.speed.x = PLAYER_SPEED
    else if ((keys.left.pressed && player.position.x > window.innerWidth * 0.10) || isPlayerMovingOnScreen1) player.speed.x = -PLAYER_SPEED
    else {
        //player moves beyond the limits then move the background and platforms
        player.speed.x = 0
        if (keys.right.pressed && !playerReachedRightLimit) {
            scrollOffset -= BACKGROUND_SPEED
            platforms.forEach(f => f.position.x -= PLAYER_SPEED);
            backGrounds.forEach(f => f.position.x -= BACKGROUND_SPEED);
        } else if (keys.left.pressed && scrollOffset < 0) {
            scrollOffset += BACKGROUND_SPEED
            platforms.forEach(f => f.position.x += PLAYER_SPEED);
            backGrounds.forEach(f => f.position.x += BACKGROUND_SPEED);
        }
    }
    //to make the player stand on the platform
    platforms.forEach(platform => {
        const playerBottom = player.position.y + player.height
        const playerRight = player.position.x + player.width
        const isPlayerAbovePlatform = playerBottom <= platform.position.y && playerBottom + player.speed.y > platform.position.y
        const isPlayerWithinPlatformLimits = playerRight >= platform.position.x && player.position.x <= platform.position.x + platform.width
        if (isPlayerAbovePlatform && isPlayerWithinPlatformLimits) {
            player.speed.y = 0
        }
    });

    //End of the game and loss of the game

    if (playerReachedRightLimit) {

    }
    if (player.position.y > canvas.height) init()

}

function init() {
    backGrounds = [];
    platforms = [];
    scrollOffset = 0;
    c.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < BACKGROUND_COUNT; i++) {
        let pits = i - 1
        if (pits < 0) pits = 0
        backGrounds.push(new Background(window.innerWidth * i, 0))
    }
    for (let i = 0; i <= PLATFORM_COUNT; i++) {
        let pits = i - 1
        if (pits < 0) pits = 0
        const position = (floorImage.width * 2 * i) + (pits * PIT_GAP)
        if (i === PLATFORM_COUNT) {
            platforms.push(new Platform(position, window.innerHeight - floorImage.height))
            platforms.push(new Platform(position + floorImage.width, window.innerHeight - floorImage.height))
            platforms.push(new Platform(position + (floorImage.width * 2), window.innerHeight - floorImage.height))
        } else {
            const random = Math.random()
            platforms.push(new Platform(position, window.innerHeight - floorImage.height))
            platforms.push(new Platform(position + floorImage.width, window.innerHeight - floorImage.height))
            if (i > 1)
                platforms.push(new Platform(position + (floorImage.width * random), window.innerHeight - (floorImage.height * 2)))
        }
    }
    player = new Player();


    keys = {
        right: {
            pressed: false
        },
        left: {
            pressed: false
        }
    }
}

init();
animate();

window.addEventListener('keydown', ({key}) => {
    switch (key) {
        case "ArrowLeft":
            player.img = spriteStandLeft
            keys.left.pressed = true
            break;
        case "ArrowRight":
            player.img = spriteStandRight
            keys.right.pressed = true
            break;
        case "ArrowUp":
            player.speed.y = -PLAYER_SPEED
            break;
        case "ArrowDown":
            player.speed.y = PLAYER_SPEED
            break;
    }
});

window.addEventListener('keyup', ({key}) => {
    console.log(scrollOffset)
    switch (key) {
        case "ArrowLeft":
            keys.left.pressed = false
            break;
        case "ArrowRight":
            keys.right.pressed = false
            break;
        case "ArrowUp":
            player.speed.y = 0
            break;
        case "ArrowDown":
            player.speed.y = 0
            break;
    }
});
window.addEventListener('resize', init);
