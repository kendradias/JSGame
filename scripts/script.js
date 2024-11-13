'use strict';

// canvas reference
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

if(!c) {
    console.log('error');
}

//ensure canvas is width and height of gameboard
const gameBoard = document.getElementById('game-board');
canvas.width = gameBoard.offsetWidth;
canvas.height = gameBoard.offsetHeight;

//boundary class
class Boundary {
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

const boundary = new Boundary({
    position: {
        x: 0,
        y: 0
    }
})

boundary.draw();

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
$(document).ready(function() {
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