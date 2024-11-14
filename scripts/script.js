'use strict';

// canvas reference
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
//ensure canvas is width and height of gameboard
const gameBoard = document.getElementById('game-board');
canvas.width = gameBoard.offsetWidth;
canvas.height = gameBoard.offsetHeight;

//boundary class
class Boundary {
    static width = 40;
    static height = 40;
    constructor({position}) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }
    draw() {
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, 
            this.width, this.height)
    }
}
//player class
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
// MAP object 
const map = [
    ['-','-','-','-','-','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-',' ','-','-',' ','-'],
    ['-',' ',' ',' ',' ','-'],
    ['-','-','-','-','-','-']
]
// create boundaries as an array 
const boundaries = []

// instantiate new player
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
        }
    })
})

// draw boundaries
boundaries.forEach((boundary) => {
    boundary.draw();
})
//draw player
player.draw()

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
    }
  },

  toggleRunning: function () {
    this.isRunning = !this.isRunning;
    //update button text to display play/pause 
    $('#play-pause-btn').text(this.isRunning ? 'Pause' : 'Play');
    }
}

//Event Listeners
//Player Movement Key event Listeners
addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'ArrowUp':
            player.velocity.y = -5
            break
        case 'ArrowLeft':
            player.velocity.x = -5
            break
        case 'ArrowDown':
            player.velocity.y = 5
            break
        case 'ArrowRight':
            player.velocity.x = 5
            break
    }
})



$(document).ready(function() {
    //initial screen upon loading - currently game screen for building purposes
    game.switchScreen('game-screen');

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