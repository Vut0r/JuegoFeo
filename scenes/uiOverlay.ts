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
    private xpBarBg!: Phaser.GameObjects.Graphics;
    private xpBarFg!: Phaser.GameObjects.Graphics
    private xpText!: Phaser.GameObjects.Text;
    private barsLoaded: boolean = false;

    constructor() {
        super({
            key: 'uiOverlay'
        });
    }

    create() : void {
        // Score text at top-right
        this.scoreText = this.add.text(10, 10, '💀: ' + this.score, {
            font: '16px Monospace', color: '#ffffff'
        });

        // position score at top-right (account for text width)
        const rightPadding = 10;
        const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
        this.scoreText.setPosition(x, 10);

        // create graphics for health and xp bars
        this.loadBars();
    }

    update() : void {
        this.healthBar();
        this.xpBar();
    }

    healthBar() : void {

        if (!this.barsLoaded) return;

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
        const currentHp = player && player.baseStats && player.baseStats.health !== undefined ? player.baseStats.health : 0;
        const maxHp = player && player.baseStats && player.baseStats.maxHealth !== undefined ? player.baseStats.maxHealth : 100;
        const pct = Phaser.Math.Clamp(currentHp / maxHp, 0, 1);

        // draw foreground
        this.healthBarFg.fillStyle(0xff0000, 1);
        this.healthBarFg.fillRect(barX + 1, barY + 1, (this.barWidth - 2) * pct, this.barHeight - 2);
    }

    xpBar() : void {

        if (!this.barsLoaded) return;

        //XP bar on top and across the width of screen
        const barX = 0;
        const barY = 0;
        const barWidth = this.scale.width;
        const barHeight = 40;

        // clear previous drawings
        this.xpBarBg.clear();
        this.xpBarFg.clear();

        // draw background (slightly lighter so foreground is visible)
        this.xpBarBg.fillStyle(0x333333, 0.8);
        this.xpBarBg.fillRect(barX, barY, barWidth, barHeight);

        // use shared player stats object for health values
        const currentXp = player && player.baseStats && player.baseStats.xp !== undefined ? player.baseStats.xp : 0;
        const levelUpReq = player && player.baseStats && player.baseStats.levelUpReq !== undefined ? player.baseStats.levelUpReq : 100;
        const pct = Phaser.Math.Clamp(currentXp / levelUpReq, 0, 1);

        // draw foreground
        this.xpBarFg.fillStyle(0xbec8d1, 1);
        this.xpBarFg.fillRect(barX + 1, barY + 1, (barWidth - 2) * pct, barHeight - 2);

        // update percent text and center it in the bar
        const percent = Math.floor(pct * 100);
        if (this.xpText) {
            this.xpText.setText(percent + '%');
            this.xpText.setPosition(barWidth / 2, barY + barHeight / 2);
        }
    }

    resetScore() : void {
        this.score = 0;
        if (this.scoreText) {
            this.scoreText.setText('💀: ' + this.score);
            const rightPadding = 10;
            const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
            this.scoreText.setPosition(x, 10);
        }
    }

    addScore(amount: number = 1) : void {
        this.score += amount;
        if (this.scoreText) {
            this.scoreText.setText('💀: ' + this.score);
            const rightPadding = 10;
            const x = (this.scale && this.scale.width) ? this.scale.width - rightPadding - this.scoreText.width : 10;
            this.scoreText.setPosition(x, 10);
        }
    }

    loadBars() : void {
        if (this.barsLoaded) return;
        this.healthBarBg = this.add.graphics();
        this.healthBarFg = this.add.graphics();
        this.xpBarBg = this.add.graphics();
        this.xpBarFg = this.add.graphics();
        this.barsLoaded = true;
    }

    unloadBars() : void {
        if (!this.barsLoaded) return;
        try {
            this.healthBarBg.clear();
            this.healthBarFg.clear();
            this.xpBarBg.clear();
            this.xpBarFg.clear();
            this.healthBarBg.destroy();
            this.healthBarFg.destroy();
            this.xpBarBg.destroy();
            this.xpBarFg.destroy();
            if (this.xpText) this.xpText.destroy();
        } catch (e) {
            // ignore if already destroyed
        }
        this.barsLoaded = false;
    }
}