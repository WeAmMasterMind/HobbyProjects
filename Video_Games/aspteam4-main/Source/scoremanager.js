/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: ScoreManager
This class is used to update the score during game play. 

See the main file, main.js for additional comments. 

*/


class ScoreManager {
    constructor() {
        this.score = 0; // Initialize the score to 0
    }

    healLevel2To3() {
        this.score += 5;
        console.log("Score updated: +5 points for healing from level 2 to 3, Total Score: " + this.score);
    }

    healLevel1To2() {
        this.score += 10;
        console.log("Score updated: +10 points for healing from level 1 to level 2, Total Score: " + this.score);
    }

    fallToLevel0() {
        this.score -= 20;
        console.log("Score updated: -20 points for falling from level 1 to 0, Total Score: " + this.score);
    }

    healBlackheart() {
        this.score += 5;
        console.log("Score updated: +5 points for healing from blackheart (level 0)");
    }

    riseToLevel1() {
        this.score += 5;
        console.log("Score updated: +5 points for healing from level 0 to level 1");
    }
    
    useSuperchargedCrystal(pointsFromHealing) {
        this.score += 5 + pointsFromHealing;
        console.log("Score updated: +" + (5 + pointsFromHealing) + " points for using a supercharged crystal, Total Score: " + this.score);
    }

    getScore() {
        return this.score;
    }
}


