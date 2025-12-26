export const player : any = {
    speed: 100,
    defense: 1,
    damage: 10,
    atkSpeed: 1000,
    health: 100,
    luck: 0,
    xpModifier: 1,
    xp: 0,
    levelUp: 100,

    reset() {
        this.speed = 100;
        this.defense = 1;
        this.damage = 10;
        this.atkSpeed = 1000;
        this.health = 100;
        this.luck = 0;
        this.xpModifier = 1;
        this.xp = 0;
        this.levelUp = 100;
    }
}