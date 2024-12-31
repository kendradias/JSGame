'use strict';

// Game object 
const game = {
    isRunning: false,
    wasRunning: false,
    isPaused: false,
    currentScreen: 'welcome-screen',
    $progressBar: $('#progress-bar'),
    $timeDisplay: $('#time-display'),
    

  //switch screen function
  switchScreen: function(screen) {
    //update current screen property
    this.currentScreen = screen;
    //hide all screens and show selected screen
    $('.screen').hide();
    $(`#${screen}`).show();
    //if current screen is game over screen, stop game
    if (this.currentScreen === 'game-over-screen') {
        this.isRunning = false;

        // Reset velocities just to be safe
        if (player) {
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
        if (enemies) {
            enemies.forEach(enemy => {
                enemy.velocity.x = 0;
                enemy.velocity.y = 0;
            });
        }
    }
  },

  toggleRunning: function () {
    this.isRunning = !this.isRunning;
    //update button text to display play/pause 
    $('#play-pause-btn').text(this.isRunning ? 'Pause' : 'Play');
    }
}

// canvas reference
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//score 
document.addEventListener('DOMContentLoaded', () => {
    const scoreEl = document.querySelector('#scoreEl')
});

//ensure canvas is width and height of gameboard
const gameBoard = document.getElementById('game-board')
canvas.width = gameBoard.offsetWidth
canvas.height = gameBoard.offsetHeight


//Boundary class
class Boundary {
    static width = 40
    static height = 40
    constructor({position}) {
        this.position = position;
        this.width = 40
        this.height = 40
    }
    draw() {
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, 
            this.width, this.height)

    }
}

//Player class
class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

//Enemy class
class Enemy{
    constructor({position, velocity, color = 'red'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.speed = 3
        this.directionChangeInterval = 75
        this.moveTimer = 0
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.moveTimer++

        //Force direction change periodically to ecourage exploration
        if (this.moveTimer >= this.directionChangeInterval) {
            this.changeDirection(true) // indicates forced change
            this.moveTimer = 0
            return
        }


        // check for boundary collisions BEFORE moving
        const potentialNextPosition = {
            x: this.position.x + this.velocity.x,
            y: this.position.y + this.velocity.y
        }

        //check if next position would cause a collision
        let willCollide = false
        boundaries.forEach(boundary => {
            if (circleCollidesWithRectangle({
                circle: {
                    ...this, 
                    position: potentialNextPosition
                },
                rectangle: boundary
            })) {
                willCollide = true
            }
        })

        // Only move if no collision will occur
        if (!willCollide) {
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        } else {
            this.changeDirection()
        }
    }

    changeDirection(forced = false) {
        const directions = ['up', 'down', 'left', 'right']
        const validDirections = directions.filter(direction => {
            // Check each direction for potential collision
            let testVelocity = { x: 0, y: 0 }
            switch(direction) {
                case 'up':
                    testVelocity.y = -this.speed
                    break
                case 'down':
                    testVelocity.y = this.speed
                    break
                case 'left':
                    testVelocity.x = -this.speed
                    break
                case 'right':
                    testVelocity.x = this.speed
                    break
            }

                        // Test if moving in this direction would cause collision
                        let wouldCollide = false
                        boundaries.forEach(boundary => {
                            if (circleCollidesWithRectangle({
                                circle: {
                                    ...this,
                                    velocity: testVelocity
                                },
                                rectangle: boundary
                            })) {
                                wouldCollide = true
                            }
                        })
                        return !wouldCollide
                    })
            
                    if (validDirections.length > 0) {
                        // Choose random valid direction
                        const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
                        switch(newDirection) {
                            case 'up':
                                this.velocity.x = 0
                                this.velocity.y = -this.speed
                                break
                            case 'down':
                                this.velocity.x = 0
                                this.velocity.y = this.speed
                                break
                            case 'left':
                                this.velocity.x = -this.speed
                                this.velocity.y = 0
                                break
                            case 'right':
                                this.velocity.x = this.speed
                                this.velocity.y = 0
                                break
                        }
                    }
    }
    getCurrentDirection() {
        if (this.velocity.y < 0) return 'up'
        if (this.velocity.y > 0) return 'down'
        if (this.velocity.x < 0) return 'left'
        if (this.velocity.x > 0) return 'right'
        return null
    }
}

//Pellet class
class Pellet {
    constructor({position, velocity}) {
        this.position = position
        this.radius = 3
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

// Keys Object 
const keys = {
    ArrowUp: {
        pressed: false
    }, 
    ArrowLeft: {
        pressed: false
    }, 
    ArrowRight: {
        pressed: false
    }, 
    ArrowDown: {
        pressed: false
    }, 
}
// last key to update when a new key is pressed
let lastKey = '';
//score property that updates 
let score = 0

// MAP Object 
const map = [
    ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-','-','-','-','-','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-','-','-','-','-','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ','-','-',' ',' ',' ','-',' ',' ',' ',' ','-',' ',' ',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-',' ',' ',' ',' ',' ',' ',' ',' ','-',' ',' ',' ',' ','-'],
    ['-',' ','-',' ','-','-','-',' ','-',' ',' ','-',' ','-','-','-',' ','-',' ','-'],
    ['-',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-'],
]
// ARRAYS //
// create boundaries as an array 
const boundaries = []
//create pellets as an array
const pellets = []
//instantiate enemies
const enemies = [
    new Enemy ({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2,
        },
        // initialize movement
        velocity: {
            x: 3,
            y: 0
        }

    })
]
//instantiate new player
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x:0,
        y:0
    }
});

// Draw Map elements based on switch case 
map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.width * i
                        }
                    })
                )
                break;
            case ' ':
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
        }
    })
})



//collision detection for player vs boundary
function circleCollidesWithRectangle({circle, rectangle}) {
    return(circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height //if top of circle collides with bottom of a rectangle
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x // if right of a circle collides with left of side of a rectangle
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y // if bottom of a circle collides with top rectangle
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width)//if left of a circle is collides with right side of a boundary
}

//RENDERING/ANIMATIONS
function animate() {
    requestAnimationFrame(animate)

    c.clearRect(0, 0, canvas.width, canvas.height)

    if (keys.ArrowUp.pressed && lastKey === 'ArrowUp') {
        //loop through all boundaries and test collision
        for (let i = 0; i < boundaries.length; i ++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    //duplicate player object and reference velocity property
                    circle: {...player,  velocity: {
                        x: 0,
                        y: -5
                    }
                },
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -5
            }
        }
    } else if (keys.ArrowLeft.pressed && lastKey === 'ArrowLeft') {
        for (let i = 0; i < boundaries.length; i ++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    //duplicate player object and reference velocity property
                    circle: {...player,  velocity: {
                        x: -5,
                        y: 0
                    }
                },
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -5
            }
        }
    } else if (keys.ArrowDown.pressed && lastKey === 'ArrowDown') {
        for (let i = 0; i < boundaries.length; i ++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    //duplicate player object and reference velocity property
                    circle: {...player,  velocity: {
                        x: 0,
                        y: 5
                    }
                },
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = 5
            }
        }
    } else if (keys.ArrowRight.pressed && lastKey === 'ArrowRight') {
        for (let i = 0; i < boundaries.length; i ++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    //duplicate player object and reference velocity property
                    circle: {...player,  velocity: {
                        x: 5,
                        y: 0
                    }
                },
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = 5
            }
        }
    }

    //rendering pellets 
    for (let i = pellets.length - 1; 0 < i; i--) {
        const pellet = pellets[i]
        pellet.draw()
        //circle to circle collision detection for player vs pellet
        if (
            Math.hypot(
                pellet.position.x - player.position.x,
                pellet.position.y - player.position.y
            ) < pellet.radius + player.radius
        ) {
            // splice pellet and increment score on each collision
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML =score
        }
    }
    //Rendering player
    boundaries.forEach((boundary) => {
        boundary.draw()

        if (circleCollidesWithRectangle({
            circle: player, 
            rectangle: boundary
        })
    ) {
        player.velocity.x = 0
        player.velocity.y = 0
    }
    })
    player.update();

    //Rendering enemies
    enemies.forEach(enemy => {
        enemy.update()

        // Circle collision detection for player vs enemy
        if (
            Math.hypot(
                enemy.position.x - player.position.x,
                enemy.position.y - player.position.y
            ) < enemy.radius + player.radius
        ) {
            // Stop all movement
            player.velocity.x = 0;
            player.velocity.y = 0;
            
            // Stop all enemies
            enemies.forEach(e => {
                e.velocity.x = 0;
                e.velocity.y = 0;
            });

            // Cancel animation frame to stop the game
            cancelAnimationFrame(animationId);
            
        }

     })
}
animate()


//Event Listeners
//Player Movement Key event Listeners
addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = 'ArrowUp'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = 'ArrowLeft'
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = true
            lastKey = 'ArrowDown'
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = 'ArrowRight'
            break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
    }
})


$(document).ready(function() {
    //initial screen upon loading - currently game screen for building purposes
    game.switchScreen('welcome-screen');

    //WELCOME SCREEN BUTTONS
    //go to instructions screen
    $('#instructions-btn').click(() => game.switchScreen('instructions-screen'));

    //INSTRUCTIONS SCREEN BUTTONS
    //start game and navigate to game screen on click 
    $('#play-game-btn').click(() => game.switchScreen('game-screen'));

    //GAME SCREEN BUTTONS
    //toggle game state on click
    $('#play-pause-btn').click(() => game.toggleRunning());
    //end game and navigate to game over screen on click
    $('#end-game-btn').click(() => game.switchScreen('game-over-screen'));
    //redirect back to welcome screen on click
    $('#quit-btn').click(() => game.switchScreen('welcome-screen'));

    //GAME OVER BUTTONS
    // switch to game screen on click
    $('#play-again-btn').click(() => game.switchScreen('game-screen'));
    //redirect back to splash screen on click
    $('#quit-btn').click(() => game.switchScreen('welcome-screen'));
    
});