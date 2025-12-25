import { preloadAssets } from './scenes/preloadAssets.ts';
import { PlayGame } from './scenes/playGame';
import { gameOptions } from './gameOptions';

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
    backgroundColor : gameOptions.gameBackgroundColor,
    scale           : scaleObject,
    scene           : [
        preloadAssets,
        PlayGame
    ],
    physics : {
        default : 'arcade'
    }
}

// the game itself
new Phaser.Game(configObject);