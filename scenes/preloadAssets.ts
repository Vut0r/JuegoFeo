import Phaser from 'phaser';

export class preloadAssets extends Phaser.Scene {

    constructor() {
        super({ key: 'PreloadAssets' });
    }

    preload(): void {

        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('enemy', 'assets/sprites/enemy.png');
        this.load.image('bullet', 'assets/sprites/bullet.png');
    }

    create(): void {

        this.scene.start('PlayGame');
    }
}