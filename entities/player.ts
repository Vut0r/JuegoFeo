export const player : any = {
    
    baseStats: {
        speed: 100,
        defense: 1,
        damage: 10,
        atkSpeed: 1000,
        health: 100,
        maxHealth: 100,
        luck: 0,
        xpModifier: 1,
        xp: 0,
        levelUpReq: 100
    },

    levelUP() {
        return {
            speed: this.baseStats.speed * 1.2,
            defense: this.baseStats.defense * 1.2,
            damage: this.baseStats.damage * 1.5,
            atkSpeed: this.baseStats.atkSpeed * 0.7,
            health: this.baseStats.health + 50,
            maxHealth: this.baseStats.maxHealth * 1.2,
            levelUpReq: this.baseStats.levelUpReq * 1.2
        }
    }
}