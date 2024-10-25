/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: GameSettings
This class is used to set difficulty levels within the game. 

See the main file, main.js for additional comments. 

*/

class GameSettings {
    constructor() {
        this.difficulty = "easy"; // Default difficulty level
        this.difficultyLevels = ["easy", "medium", "hard"]; // Supported difficulty levels
    }

    // Set the difficulty level
    setDifficulty(difficulty) {
        if (this.difficultyLevels.includes(difficulty)) {
            this.difficulty = difficulty;
            console.log(`Difficulty set to ${difficulty}`);
        } else {
            console.error("Invalid difficulty level");
        }
    }

    // Get the current difficulty level
    getDifficulty() {
        return this.difficulty;
    }

    // Method to prompt the user to select a difficulty level
    promptForDifficulty() {
        const selectedDifficulty = prompt(`Choose difficulty: ${this.difficultyLevels.join(", ")}`, this.difficulty);
        if (this.difficultyLevels.includes(selectedDifficulty)) {
            this.setDifficulty(selectedDifficulty);
        } else {
            alert(`Invalid difficulty selected. Please choose one of: ${this.difficultyLevels.join(", ")}`);
        }
    }
}
