/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: UI
This class update UI object states such as score, remaining clicks and remaining turns as the 
game advances

See the main file, main.js for additional comments. 

*/

class UI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.healCounterElement = document.getElementById('healCounter');
        this.remainingTurnsElement = document.getElementById('remainingTurns');
        this.difficultySelectElement = document.getElementById('difficultySelect'); // Ensure this element exists
    }

    updateScore(score) {
        console.log("Updating score display to: " + score);  // Log the score being set
        this.scoreElement.textContent = `Score: ${score}`;  // Update the score text
    }

    updateHealCounter(remainingHeals) {
        console.log("Updating heal counter display to: " + remainingHeals);  // Log the remaining heals
        this.healCounterElement.textContent = `Healing Clicks: ${remainingHeals}`;
    }

    updateRemainingTurns(remainingTurns) { 
        console.log("Updating remaining turns display to: " + remainingTurns);  // Log the remaining heals
        this.remainingTurnsElement.textContent = `Remaining Turns: ${remainingTurns}`;
    }

    setDifficultyButtonHandler(handler) {
        if (this.difficultySelectElement) { // Check if the element exists
            this.difficultySelectElement.addEventListener('change', handler);
        } else {
            console.error("Difficulty dropdown not found in the DOM.");
        }
    }
}

