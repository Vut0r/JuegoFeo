import Phaser from 'phaser';
import { preloadAssets } from './scenes/preloadAssets';
import { PlayGame } from './scenes/playGame';
import { gameOptions } from './gameOptions';
import { startMenu } from './scenes/startMenu';
import { uiOverlay } from './scenes/uiOverlay';

// Initialize Scale Manager
const scaleObject : Phaser.Types.Core.ScaleConfig = {
    mode        : Phaser.Scale.FIT,
    autoCenter  : Phaser.Scale.CENTER_BOTH,
    parent      : 'thegame',
    width       : gameOptions.gameSize.width,
    height      : gameOptions.gameSize.height
}

// game configuration object
const configObject : Phaser.Types.Core.GameConfig = { 
    type            : Phaser.AUTO,
    input           : { gamepad: true },
    backgroundColor : gameOptions.gameBackgroundColor,
    scale           : scaleObject,
    scene           : [
        preloadAssets,
        startMenu,
        PlayGame,
        uiOverlay
    ],
    physics : {
        default : 'arcade'
    }
}

// the game itself
new Phaser.Game(configObject);