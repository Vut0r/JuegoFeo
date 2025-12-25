import Phaser from "phaser";
import { gameOptions } from "../gameOptions";

export class PlayGame extends Phaser.Scene {

    constructor() {
        super({
            key: 'PlayGame'
        });
    }

    controlKeys: any;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    enemyGroup!: Phaser.Physics.Arcade.Group;
    gamepad: Phaser.Input.Gamepad.Gamepad | null = null;

    create() : void {

        // add player, enemies group and bullets group
        this.player = this.physics.add.sprite(gameOptions.gameSize.width / 2, gameOptions.gameSize.height / 2, 'player');
        this.enemyGroup = this.physics.add.group();
        const bulletGroup : Phaser.Physics.Arcade.Group = this.physics.add.group();

        // set keyboard controls
        const keyboard : Phaser.Input.Keyboard.KeyboardPlugin = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin; 
        this.controlKeys = keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        // gamepad hookup: capture first connected pad (if any) and listen for connections
        const gamepadPlugin : Phaser.Input.Gamepad.GamepadPlugin = this.input.gamepad as Phaser.Input.Gamepad.GamepadPlugin;
        this.gamepad = gamepadPlugin.gamepads[0] || null;
        gamepadPlugin.on('connected', (pad : Phaser.Input.Gamepad.Gamepad) => {
            if (!this.gamepad) {
                this.gamepad = pad;
            }
        });

        // set outer rectangle and inner rectangle; enemy spawn area is between these rectangles
        const outerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-100, -100, gameOptions.gameSize.width + 200, gameOptions.gameSize.height + 200);
        const innerRectangle : Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(-50, -50, gameOptions.gameSize.width + 100, gameOptions.gameSize.height + 100);

        // timer event to add enemies
        this.time.addEvent({
            delay       : gameOptions.enemyRate,
            loop        : true,
            callback    : () => {
                const spawnPoint : Phaser.Geom.Point = Phaser.Geom.Rectangle.RandomOutside(outerRectangle, innerRectangle);
                const enemy : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'enemy'); 
                this.enemyGroup.add(enemy); 
            },
        });

        // timer event to fire bullets
        this.time.addEvent({
            delay       : gameOptions.bulletRate,
            loop        : true,
            callback    : () => {
                const closestEnemy : any = this.physics.closest(this.player, this.enemyGroup.getMatching('visible', true));
                if (closestEnemy != null) {
                    const bullet : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(this.player.x, this.player.y, 'bullet'); 
                    bulletGroup.add(bullet); 
                    this.physics.moveToObject(bullet, closestEnemy, gameOptions.bulletSpeed);
                }
            },
        });

        // bullet Vs enemy collision
        this.physics.add.collider(bulletGroup, this.enemyGroup, (bullet : any, enemy : any) => {
            bulletGroup.killAndHide(bullet);
            bullet.body.checkCollision.none = true;
            this.enemyGroup.killAndHide(enemy);
            enemy.body.checkCollision.none = true;
        });

        // player Vs enemy collision
        this.physics.add.collider(this.player, this.enemyGroup, () => {
            this.scene.restart();
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
            this.player.setVelocity(movementDirection.x * gameOptions.playerSpeed, movementDirection.y * gameOptions.playerSpeed);
        }
        else {
            if (movementDirection.x == 0 || movementDirection.y == 0) {
                this.player.setVelocity(movementDirection.x * gameOptions.playerSpeed, movementDirection.y * gameOptions.playerSpeed);
            }
            else {
                this.player.setVelocity(movementDirection.x * gameOptions.playerSpeed / Math.sqrt(2), movementDirection.y * gameOptions.playerSpeed / Math.sqrt(2));    
            }
        }

        // move enemies towards player
        this.enemyGroup.getMatching('visible', true).forEach((enemy : any) => {
            this.physics.moveToObject(enemy, this.player, gameOptions.enemySpeed);
        });
    }
}