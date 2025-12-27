import Phaser from 'phaser';
import { player } from '../entities/player';
import { PlayGame } from './playGame';

export class uiOverlay extends Phaser.Scene {

    scoreText!: Phaser.GameObjects.Text;
    score: number = 0;
    private healthBarBg!: Phaser.GameObjects.Graphics;
    private healthBarFg!: Phaser.GameObjects.Graphics;
    private barWidth: number = 48;
    private barHeight: number = 8;

    constructor() {
        super({
            key: 'uiOverlay'
        });
    }

    create() : void {
        // Score text at top-right
        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, {
            font: '16px Monospace', color: '#ffffff'
        });

        // position score at top-right (account for text width)
        const rightPadding = 10;
        const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
        this.scoreText.setPosition(x, 10);

        // create graphics for health bar (background and foreground)
        this.healthBarBg = this.add.graphics();
        this.healthBarFg = this.add.graphics();
    }

    update() : void {
        // try to get the PlayGame scene and its player sprite
        const playScene = this.scene.get('PlayGame') as PlayGame | Phaser.Scene | undefined;
        if (!playScene) return;

        // the PlayGame scene exposes `player` sprite; if missing, skip
        const playerSprite: any = (playScene as any).player;
        if (!playerSprite || !playerSprite.body) return;

        // compute screen position from the PlayGame camera
        const cam = (playScene as any).cameras && (playScene as any).cameras.main;
        const worldX = playerSprite.x;
        const worldY = playerSprite.y;
        const screenX = cam ? worldX - cam.worldView.x : worldX;
        const screenY = cam ? worldY - cam.worldView.y : worldY;

        // location above player
        const barX = screenX - this.barWidth / 2;
        const barY = screenY - 36;

        // clear previous drawings
        this.healthBarBg.clear();
        this.healthBarFg.clear();

        // draw background (slightly lighter so foreground is visible)
        this.healthBarBg.fillStyle(0x333333, 0.8);
        this.healthBarBg.fillRect(barX, barY, this.barWidth, this.barHeight);

        // use shared player stats object for health values
        const currentHp = player && player.stats && player.stats.health !== undefined ? player.stats.health : 0;
        const maxHp = player && player.stats && player.stats.maxHealth !== undefined ? player.stats.maxHealth : 100;
        const pct = Phaser.Math.Clamp(currentHp / maxHp, 0, 1);

        // draw foreground
        this.healthBarFg.fillStyle(0xff0000, 1);
        this.healthBarFg.fillRect(barX + 1, barY + 1, (this.barWidth - 2) * pct, this.barHeight - 2);
    }
    resetScore() : void {
        this.score = 0;
        if (this.scoreText) {
            this.scoreText.setText('Score: ' + this.score);
            const rightPadding = 10;
            const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
            this.scoreText.setPosition(x, 10);
        }
    }

    addScore(amount: number = 1) : void {
        this.score += amount;
        if (this.scoreText) {
            this.scoreText.setText('Score: ' + this.score);
            const rightPadding = 10;
            const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
            this.scoreText.setPosition(x, 10);
        }
    }
}