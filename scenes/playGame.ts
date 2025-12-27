import Phaser from "phaser";
import { gameOptions } from "../gameOptions";
import { player } from "../entities/player";
import { enemy as enemyConfig } from "../entities/enemy";
import { weapon } from "../entities/weapon";
import { xpShard } from "../entities/xpShard";
import { uiOverlay } from "./uiOverlay";

export class PlayGame extends Phaser.Scene {

    constructor() {
        super({
            key: 'PlayGame'
        });
    }

    gamepad: Phaser.Input.Gamepad.Gamepad | null = null;
    controlKeys: any;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    enemyGroup!: Phaser.Physics.Arcade.Group;
    xpShardGroup!: Phaser.Physics.Arcade.Group;
    uiScene!: uiOverlay;
    
    create() : void {

        // add player, enemies group, xp group and bullets group
        this.player = this.physics.add.sprite(gameOptions.gameSize.width / 2, gameOptions.gameSize.height / 2, 'player');
        this.enemyGroup = this.physics.add.group();
        const weaponGroup : Phaser.Physics.Arcade.Group = this.physics.add.group();
        this.xpShardGroup = this.physics.add.group();

        // ensure the UI overlay scene is launched and on top before accessing its objects
        if (!this.scene.isActive('uiOverlay')) {
            this.scene.launch('uiOverlay');
        }
        this.uiScene = this.scene.get('uiOverlay') as uiOverlay;
        this.scene.bringToTop('uiOverlay');

        // set keyboard controls
        const keyboard : Phaser.Input.Keyboard.KeyboardPlugin = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin; 
        this.controlKeys = keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        // gamepad hookup: capture first connected pad (if any) and listen for connections
        const gamepadPlugin = (this.input as any).gamepad as Phaser.Input.Gamepad.GamepadPlugin | undefined;
            if (gamepadPlugin) {
                this.gamepad = gamepadPlugin.gamepads[0] || null;
                gamepadPlugin.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
                    if (!this.gamepad) this.gamepad = pad;
                });
                } else {
                    this.gamepad = null;
        }

        // set outer rectangle and inner rectangle; enemy spawn area is between these rectangles
        const outerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-100, -100, gameOptions.gameSize.width + 200, gameOptions.gameSize.height + 200);
        const innerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-50, -50, gameOptions.gameSize.width + 100, gameOptions.gameSize.height + 100);

        // timer event to add enemies
        this.time.addEvent({
            delay       : enemyConfig.spawnRate,
            loop        : true,
            callback    : () => {
                const spawnPoint : Phaser.Geom.Point = Phaser.Geom.Rectangle.RandomOutside(outerRectangle, innerRectangle);
                const enemyEntity: any = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy');

                // determine elite spawn using configured probability
                const eliteProb = (enemyConfig.spawn && typeof enemyConfig.spawn.eliteProbability === 'number') ? enemyConfig.spawn.eliteProbability : 10;
                const eliteMultiplier = (enemyConfig.spawn && typeof enemyConfig.spawn.eliteMultiplier === 'number') ? enemyConfig.spawn.eliteMultiplier : 2;
                const isElite = Phaser.Math.Between(1, 100) <= eliteProb;

                if (isElite) {
                    //For elites, we apply a glowing tint and scale up their stats
                    enemyEntity.setTint(0xffd700);

                    const stats = enemyConfig.elite(eliteMultiplier);
                    enemyEntity.speed = stats.speed;
                    enemyEntity.damage = stats.damage;
                    enemyEntity.maxHealth = stats.health;
                    enemyEntity.health = stats.health;
                    enemyEntity.shardBonus = stats.shardBonus;
                    enemyEntity.setData('isElite', true);
                } else {
                    enemyEntity.setTint(0xff00ff);
                    enemyEntity.speed = enemyConfig.stats.speed;
                    enemyEntity.damage = enemyConfig.stats.damage;
                    enemyEntity.maxHealth = enemyConfig.stats.health;
                    enemyEntity.health = enemyConfig.stats.health;
                    enemyEntity.shardBonus = enemyConfig.stats.shardBonus;
                    enemyEntity.setData('isElite', false);
                }

                this.enemyGroup.add(enemyEntity);
            },
        });

        // timer event to fire bullets
        this.time.addEvent({
            delay       : player.baseStats.atkSpeed,
            loop        : true,
            callback    : () => {
                const closestEnemy : any = this.physics.closest(this.player, this.enemyGroup.getMatching('visible', true));
                if (closestEnemy != null) {
                    const projectile : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(this.player.x, this.player.y, 'bullet'); 
                    weaponGroup.add(projectile); 
                    this.physics.moveToObject(projectile, closestEnemy, weapon.projectileSpeed);
                }
            },
        });

        // projectile Vs enemy collision
        this.physics.add.collider(weaponGroup, this.enemyGroup, (projectile : any, enemyObj : any) => {

            // destroy projectile
            weaponGroup.killAndHide(projectile);
            projectile.body.checkCollision.none = true;

            // apply damage to this enemy instance
            enemyObj.health = (typeof enemyObj.health === 'number') ? enemyObj.health - player.baseStats.damage : (enemyObj.maxHealth || (enemyConfig.stats && enemyConfig.stats.health) || 0) - player.baseStats.damage;

            // if enemy died, award score, hide and spawn shard
            if (enemyObj.health <= 0) {
                if (this.uiScene && typeof this.uiScene.addScore === 'function') {
                    this.uiScene.addScore(1);
                } else {
                    const uiScene = this.scene.get('uiOverlay') as uiOverlay;
                    if (uiScene && typeof uiScene.addScore === 'function') uiScene.addScore(1);
                }

                this.enemyGroup.killAndHide(enemyObj);
                enemyObj.body.checkCollision.none = true;
                enemyObj.health = (enemyObj.maxHealth !== undefined) ? enemyObj.maxHealth : ((enemyConfig.stats && enemyConfig.stats.health) || enemyObj.health || 0);

                const shardSprite : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(enemyObj.x, enemyObj.y, 'xpShard');
                this.xpShardGroup.add(shardSprite);
                return;
            }
        });

        // player Vs enemy collision health calculation
        this.physics.add.collider(this.player, this.enemyGroup, (playerObj: any, enemyObj: any) => {
            player.baseStats.health -= ((enemyObj.damage || enemyConfig.stats.damage) - player.baseStats.defense);
            if (player.baseStats.health <= 0) {
                console.log('Game Over');
                player.baseStats.health = player.baseStats.maxHealth;
                this.scene.start('startMenu');
            }
        });
        
        //player Vs xpShard collision
        this.physics.add.collider(this.player, this.xpShardGroup, (playerObj : any, shardSprite : any) => {
            this.xpShardGroup.killAndHide(shardSprite);
            shardSprite.body.checkCollision.none = true;
            player.baseStats.xp += xpShard.value * player.baseStats.xpModifier;
            console.log('Player XP: ' + player.baseStats.xp);
        });
    }

    update() {   
        
        // set movement direction according to keys pressed or gamepad
        let movementDirection : Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
        const usingGamepad = !!(this.gamepad && this.gamepad.connected);

        if (usingGamepad) {
            const deadzone = 0.15;
            const axisH = (this.gamepad!.axes && this.gamepad!.axes.length > 0) ? this.gamepad!.axes[0].getValue() : 0;
            const axisV = (this.gamepad!.axes && this.gamepad!.axes.length > 1) ? this.gamepad!.axes[1].getValue() : 0;
            movementDirection.x = Math.abs(axisH) > deadzone ? axisH : 0;
            movementDirection.y = Math.abs(axisV) > deadzone ? axisV : 0;
        }
        else {
            if (this.controlKeys.right.isDown) {
                movementDirection.x ++;  
            }
            if (this.controlKeys.left.isDown) {
                movementDirection.x --;
            }
            if (this.controlKeys.up.isDown) {
                movementDirection.y --;    
            }
            if (this.controlKeys.down.isDown) {
                movementDirection.y ++;    
            }
        }

        // set player velocity according to movement direction
        this.player.setVelocity(0, 0);
        if (usingGamepad) {
            this.player.setVelocity(movementDirection.x * player.baseStats.speed, movementDirection.y * player.baseStats.speed);
        }
        else {
            if (movementDirection.x == 0 || movementDirection.y == 0) {
                this.player.setVelocity(movementDirection.x * player.baseStats.speed, movementDirection.y * player.baseStats.speed);
            }
            else {
                this.player.setVelocity(movementDirection.x * player.baseStats.speed / Math.sqrt(2), movementDirection.y * player.baseStats.speed / Math.sqrt(2));    
            }
        }

        // move enemies towards player
        this.enemyGroup.getMatching('visible', true).forEach((enemy : any) => {
            this.physics.moveToObject(enemy, this.player, enemy.speed);
        });

        //level up conditions
        if (player.baseStats.xp >= player.baseStats.levelUpReq) {
            player.baseStats.xp -= player.baseStats.levelUpReq;
            player.baseStats.levelUpReq = Math.floor(player.baseStats.levelUpReq * 1.5);
            const uplevelplayer = player.levelUP();
            player.baseStats.speed = uplevelplayer.speed;
            player.baseStats.defense = uplevelplayer.defense;
            player.baseStats.damage = uplevelplayer.damage;
            player.baseStats.atkSpeed = uplevelplayer.atkSpeed;
            player.baseStats.health = uplevelplayer.health;
            player.baseStats.maxHealth = uplevelplayer.maxHealth;
            console.log('level up! New stats: ' +
                'Health: ' + player.baseStats.health +
                ', Damage: ' + player.baseStats.damage +
                ', Speed: ' + player.baseStats.speed +
                ', Attack Speed: ' + player.baseStats.atkSpeed
            );
        }
    }
}