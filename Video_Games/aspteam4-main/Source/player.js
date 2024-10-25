/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: Player
This class is used to process player actions which consists of clicking on crystals
to heal their state from multiple different levels. 

See the main file, main.js for additional comments. 

*/

class Player {
    constructor(healingClicks = 5) {
        this.initialHealingClicks = healingClicks;
        this.healingClicks = healingClicks;
        this.score = 0;
    }

    resetHealingClicks() {
        this.healingClicks = this.initialHealingClicks;
    }

    healCrystal(grid, x, y, scoreManager, ui) {
        if (this.healingClicks > 0) {
            const crystal = grid.getCrystal(x, y);
            if (crystal && crystal.level < 4) {
                const prevLevel = crystal.level;
                crystal.heal();  // Heal the crystal
                this.healingClicks--;  // Decrease healing clicks

                // Handle scoring based on previous and current crystal levels
                if (scoreManager) {
                    if (prevLevel === 2 && crystal.level === 3) {
                        scoreManager.healLevel2To3();  // +5 points for healing from level 2 to 3
                    } else if (prevLevel === 1 && crystal.level === 2) {
                        scoreManager.healLevel1To2();  // +10 points for healing from level 1 to 2
                    } else if (prevLevel === 0 && crystal.level === 1) {
                        scoreManager.riseToLevel1();  // +5 points for healing from level 0 to 1
                    } else if (prevLevel === 1 && crystal.level === 0) {
                        scoreManager.fallToLevel0();  // -20 points for falling from level 1 to 0
                    }
                }

                // Update the UI with the new score and remaining healing clicks
                if (ui) {
                    ui.updateScore(scoreManager.getScore());  // Update the score in the UI
                    ui.updateHealCounter(this.healingClicks);  // Update heal counter in the UI
                }

                grid.updateGrid();  // Redraw the grid
            }
        } else {
            console.log("No healing clicks left.");
        }
    }

    reduceClicks(amount) {
        this.healingClicks -= amount;
    }

    hasClicks() {
        return this.healingClicks > 0;
    }
}
