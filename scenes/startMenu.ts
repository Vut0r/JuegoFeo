import Phaser from "phaser";
import { PlayGame } from './playGame';
import { uiOverlay } from "./uiOverlay";

export class startMenu extends Phaser.Scene {
    
    constructor() {
        super({
            key: 'startMenu'
        });
    }

    uioverlayScene!: uiOverlay;

    create() : void {

        this.add.image(0, 0, 'fondo').setOrigin(0).setDepth(0);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, 'logo').setDepth(1);
        const playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2 + 100, 'playButton').setDepth(1).setInteractive();
        
        playButton.setInteractive();
        playButton.on('pointerdown', () => {
            this.uioverlayScene = this.scene.get('uiOverlay') as uiOverlay;
            if (this.uioverlayScene) {
                this.uioverlayScene.resetScore();
            }
            this.scene.start('PlayGame');
        });
        playButton.on('pointerover', () => {
            playButton.setScale(1.1);
        });
        playButton.on('pointerout', () => {
            playButton.setScale(1);
        });
    }

}