export const enemy : any = {

    spawnRate: 800,

    // spawn-related settings
    spawn: {
        eliteProbability: 10, // percent chance (1-100)
        eliteMultiplier: 2    // multiplier applied to base stats for elite enemies
    },

    stats : {
        speed: 50,
        damage: 9,
        health: 10,
        shardBonus: 1
    },

    elite(multiplier: number) {
        return {
            speed: this.stats.speed * multiplier,
            damage: this.stats.damage * multiplier,
            health: this.stats.health * multiplier,
            shardBonus: this.stats.shardBonus * multiplier
        };
    }
}