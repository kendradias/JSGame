'use strict'

// Configuration and Constants
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
//ensure canvas is width and height of gameboard
const gameBoard = document.getElementById('game-board')
canvas.width = gameBoard.offsetWidth - 30 //removed unecessary padding
canvas.height = gameBoard.offsetHeight 

// Game object 
const game = {
    isRunning: false,
    isPaused: false,
    forceQuit: false,
    playerName: '',
    score: 0,
    scoreEl: null,
    isWin: false,
    winningScore: 1640, // score acheived if player collects all the pellets on the map (needed for a win)
    currentScreen: 'welcome-screen', //default screen
    difficulty: 'easy', // default difficulty

    // adjust difficulty based on difficulty select 
    difficultySettings :{
        easy: {
            enemySpeedMultiplier: 1.5,   
            directionChangeInterval: 50,
            enemyCount: 1
        },
        medium: {
            enemySpeedMultiplier: 2,  
            directionChangeInterval: 70,
            enemyCount: 1  
        },
        hard: {
            enemySpeedMultiplier: 2, 
            directionChangeInterval: 70,
            enemyCount: 2
        }
    },
    
    //initialize score 
    initializeScore: function() {
        this.scoreEl = document.querySelector('#scoreEl');
        this.updateScore(0);
    },

    //add points, update score
    updateScore: function(points) {
        this.score += points;
        if (this.scoreEl) {
            this.scoreEl.innerHTML = this.score;
        }
        // Check win condition after updating score
        this.checkWinCondition();
    },

    // Set player name 
    setPlayerName: function(name) {
        this.playerName =  name
        // update display
        $('#playerNameDisplay').text(name)
    },

    // Add method to set difficulty
    setDifficulty: function(level) {
        if (this.difficultySettings[level]) {

            this.difficulty = level;
            $('#difficulty-select-instructions, #difficulty-select-gameover').val(level);
            
            // Clear existing enemies
            enemies.length = 0;
            
            // Add enemies based on difficulty
            const settings = this.difficultySettings[level];
            for(let i = 0; i < settings.enemyCount; i++) {
                enemies.push(
                    new Enemy({
                        position: {
                            // Offset second enemy's starting position
                            x: Boundary.width * (4 + i * 6) + Boundary.width / 2,
                            y: Boundary.height * 8 + Boundary.height / 2,
                        },
                        velocity: {
                            x: 2 * settings.enemySpeedMultiplier,
                            y: 0
                        },
                        color: i === 0 ? 'red' : 'purple' // Different color for second enemy
                    })
                );
            }
            return true;
        }
        return false;
    },

    startGame: function() {
        this.isRunning = true
        // Start animations
        animate()
    },

    checkWinCondition: function() {
        if (this.score >= this.winningScore) {
            this.isWin = true

            this.endGame()
        }
    },

    endGame: function() {
        const $message = $('#game-over-message')
        // First remove any existing classes
        $message.removeClass('win-message lose-message')
        
        if (this.isWin) {
            $message
                .text(`You Won! Your Score is ${this.score}`)
                .addClass('win-message')
        } else {
            $message
                .text(`You Lost! Your Score is ${this.score}`)
                .addClass('lose-message')
        }
    
        setTimeout(() => {
            this.switchScreen('game-over-screen')
        }, 500)
    },
    resetGame: function() {
        // Reset game states 
        this.isRunning = true
        this.isPaused = false
        this.forceQuit = false
        // Reset win state
        this.isWin = false 
        // Reset pause/play btn
        $('#play-pause-btn').text('PAUSE')
        // Reset score
        this.score = 0;
        if (this.scoreEl) {
            this.scoreEl.innerHTML = '0';
        }
        // Reset all entities
        this.resetEntities()

        // Reset movement states
        Object.keys(keys).forEach(key => keys[key].pressed = false)
        lastKey = ''
    },

    toggleRunning: function () {
        //update button text to display play/pause 
        this.isPaused = !this.isPaused
        $('#play-pause-btn').text(this.isPaused ? 'PLAY' : 'PAUSE')
    },

    resetEntities: function() {
        // Clear arrays
        pellets.length = 0;

        // Reset player to start position
        player.position = {
            x: Boundary.width + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        };
        player.velocity = { x: 0, y: 0 };

        // Reset enemy positions and velocities
        const settings = this.difficultySettings[this.difficulty];
        enemies.forEach((enemy, i) => {
            enemy.position = {
                x: Boundary.width * (4 + i * 6) + Boundary.width / 2,
                y: Boundary.height * 8 + Boundary.height / 2
            };
            enemy.velocity = {
                x: 2 * settings.enemySpeedMultiplier,
                y: 0
            };
            enemy.moveTimer = 0;
        });

        // Regenerate map elements
        map.forEach((row, i) => {
            row.forEach((symbol, j) => {
                if (symbol === ' ') {
                    pellets.push(
                        new Pellet({
                            position: {
                                x: j * Boundary.width + Boundary.width / 2,
                                y: i * Boundary.height + Boundary.height / 2
                            }
                        })
                    );
                }
            });
        });
    },

    //switch screen function
    switchScreen: function(screen) {
        //update current screen property
        this.currentScreen = screen;
        //hide all screens and show selected screen
        $('.screen').hide()
        $(`#${screen}`).show()

        if (screen === 'game-screen') {
            // get difficulty select from previous screen
            this.resetGame()
            const selectedDifficulty = $('#difficulty-select-instructions').val()
            this.setDifficulty(selectedDifficulty)
            this.startGame()
        }
        //if current screen is game over screen, stop game
        if (this.currentScreen === 'game-over-screen') {
        }
  }
}

//****************************************** CLASSES***********************************************/
//Boundary class
class Boundary {
    static width = 40
    static height = 40
    constructor({position}) {
        this.position = position
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
    stop() {
        this.velocity.x = 0
        this.velocity.y = 0
    }

     //handling movement for player, checking for boundary collisions and reset last key to enable a change in direction to the newest key pressed
     handleMovement(keys, lastKey, boundaries) {
        if (keys.w.pressed && lastKey === 'w') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (
                    circleCollidesWithRectangle({
                        circle: {...this, velocity: {
                            x: 0,
                            y: -5
                        }},
                        rectangle: boundary
                    })
                ) {
                    this.velocity.y = 0
                    break
                } else {
                    this.velocity.y = -5
                }
            }
        } else if (keys.a.pressed && lastKey === 'a') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (
                    circleCollidesWithRectangle({
                        circle: {...this, velocity: {
                            x: -5,
                            y: 0
                        }},
                        rectangle: boundary
                    })
                ) {
                    this.velocity.x = 0
                    break
                } else {
                    this.velocity.x = -5
                }
            }
        } else if (keys.s.pressed && lastKey === 's') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (
                    circleCollidesWithRectangle({
                        circle: {...this, velocity: {
                            x: 0,
                            y: 5
                        }},
                        rectangle: boundary
                    })
                ) {
                    this.velocity.y = 0
                    break
                } else {
                    this.velocity.y = 5
                }
            }
        } else if (keys.d.pressed && lastKey === 'd') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (
                    circleCollidesWithRectangle({
                        circle: {...this, velocity: {
                            x: 5,
                            y: 0
                        }},
                        rectangle: boundary
                    })
                ) {
                    this.velocity.x = 0
                    break
                } else {
                    this.velocity.x = 5
                }
            }
        }
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
        this.position = {
            x: Math.round(position.x),
            y: Math.round(position.y)
        }
        this.velocity = {
            x: velocity.x,
            y: velocity.y
        }
        this.radius = 15
        this.color = color
        this.baseSpeed = 2
        this.speed = this.baseSpeed * game.difficultySettings[game.difficulty].enemySpeedMultiplier; //set speed based on diffiulty selected
        this.directionChangeInterval = game.difficultySettings[game.difficulty].directionChangeInterval; //set direction change interval based on diffiulty selected
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

        //Force direction change periodically to ecourage exploration
        if (this.moveTimer >= this.directionChangeInterval) {
            this.changeDirection(true) // indicates forced change
            this.moveTimer = 0 //reset timer
            return
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

    // check if enemy is colliding with player
    checkPlayerCollision(player) {
        return Math.hypot(
            this.position.x - player.position.x,
            this.position.y - player.position.y
        ) < this.radius + player.radius
    }
}

//Pellet class
class Pellet {
    constructor({position}) {
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

    checkCollision(player, pellets, i) {
        if (
            Math.hypot(
                //circle to circle collision detection for player vs pellet
                this.position.x - player.position.x,
                this.position.y - player.position.y
            ) < this.radius + player.radius
        ) {
            // splice pellet and increment score on each collision
            pellets.splice(i, 1)
            game.updateScore(10)
        }
    }
}

// GLOBALS //
// Keys Object 
const keys = {
    w: {
        pressed: false
    }, 
    a: {
        pressed: false
    }, 
    d: {
        pressed: false
    }, 
    s: {
        pressed: false
    }, 
}
// last key to update when a new key is pressed
let lastKey = ''

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

//collision detection for player/enemy vs boundary
function circleCollidesWithRectangle({circle, rectangle}) {
    return(circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height //if top of circle collides with bottom of a rectangle
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x // if right of a circle collides with left of side of a rectangle
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y // if bottom of a circle collides with top rectangle
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width)//if left of a circle is collides with right side of a boundary
}
// create boundaries as an array 
const boundaries = []
//create pellets as an array
const pellets = []
//instantiate enemies
const enemies = [
    new Enemy ({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 8 + Boundary.height / 2,
        },
        // initialize movement
        velocity: {
            x: 2,
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
})

//RENDERING/ANIMATIONS
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
                // Skip pellet creation at player start position
                if (!(i === 1 && j === 1)) {  // These are the coordinates where the player starts
                pellets.push(
                    new Pellet({
                        position: {
                            x: j * Boundary.width + Boundary.width / 2,
                            y: i * Boundary.height + Boundary.height / 2
                        }
                    })
                )
            }
        }
    })
})

function animate() {
    // initiate animation frame 
    const animationId = requestAnimationFrame(animate)

    // if game is paused, just redraw current state 
    if (game.isPaused) {
        // Draw current state
        boundaries.forEach(boundary => boundary.draw())
        pellets.forEach(pellet => pellet.draw())
        player.draw()
        enemies.forEach(enemy => enemy.draw())
        return
    }

    // Check for forcequit condition
    if (game.forceQuit) {
        cancelAnimationFrame(animationId)
        return
    }
    
    c.clearRect(0, 0, canvas.width, canvas.height)

    // Only allow player movement if game is still running
    if (game.isRunning) {
        player.handleMovement(keys, lastKey, boundaries);
    }

    //Rendering pellets, checking collision
    for (let i = pellets.length - 1; i >= 0; i--) {
        const pellet = pellets[i]
        pellet.draw()
        // Only check collisions if player has moved from starting position
        if (player.velocity.x !== 0 || player.velocity.y !== 0) {
            pellet.checkCollision(player, pellets, i)
        }
    }
    
    //Rendering player, checking collision
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


    // Rendering enemies, checking collision
    enemies.forEach(enemy => {
        enemy.update()

        // Check if player collides with enemy or wins the game, and stop animations if it does 
        if (enemy.checkPlayerCollision(player) || game.isWin) {
            cancelAnimationFrame(animationId);
            game.endGame();
        }
    })
}

//Event Listeners
//Player Movement Key event Listeners
addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})


$(document).ready(function() {
    //initial screen upon loading 
    game.switchScreen('welcome-screen')
    //initialize score 
    game.initializeScore()

    // Add error handling for name input
    const $nameError = $('#name-error')
    const $nameInput = $('#player-name-input')


    //allow user to press enter to navigate between screens
    $(document).on('keypress', function(e) {
        // Check if the key pressed was Enter
        if (e.which === 13 || e.keyCode === 13) {
            // Check which screen is currently active
            if (game.currentScreen === 'welcome-screen' && $('#player-name-input').is(':focus')) {
                $('#instructions-btn').click();
            } else if (game.currentScreen === 'instructions-screen') {
                $('#play-game-btn').click();
            }
        }
    });

    // Hide error when user starts typing
    $nameInput.on('input', function() {
        $nameError.hide()
    })

    //WELCOME SCREEN BUTTONS
    // save player name and go to instructions screen
    $('#instructions-btn').click(function(e) {
        e.preventDefault()
        const playerName = $nameInput.val().trim()
        
        if (!playerName) {
            // Show error message if no name is entered 
            $nameError.show()
            return
        }
        
        // Store the player name
        game.setPlayerName(playerName)
        // Continue to instructions screen
        game.switchScreen('instructions-screen')
    })

    //INSTRUCTIONS SCREEN BUTTONS
    // Keep difficulty selects in sync
    $('#play-game-btn').click(function() {
        // Get difficulty value right when button is clicked
        const selectedDifficulty = $('#difficulty-select-instructions').val()
        game.setDifficulty(selectedDifficulty)
        game.switchScreen('game-screen')
    })

    //GAME SCREEN BUTTONS
    //toggle game state on click
    $('#play-pause-btn').on('click', () => {
        game.toggleRunning()
    })

    //reset button
    $('#reset-btn').on('click', () => {
        game.resetGame()
    })
    
    //end game and navigate to game over screen on click
    $('#end-game-btn').click(function() {
        game.forceQuit = true
        game.isRunning = false
        // unqiue message for this case 
        const gameOverMessage = "Game Over!"
        $('#game-over-message').text(gameOverMessage)
        game.switchScreen('game-over-screen')
    })
    //GAME OVER BUTTONS
    // switch to game screen on click
    $('#play-again-btn').click(function() {
        const selectedDifficulty = $('#difficulty-select-gameover').val()
        // Set difficulty from instructions screen before starting game
        game.resetGame()
        game.setDifficulty(selectedDifficulty)
        game.switchScreen('game-screen')
    })
    //redirect back to splash screen on click
    $('#quit-btn').click(function() {
        game.switchScreen('welcome-screen')
    })
    
})