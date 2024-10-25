/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: Game
This class is used to manage multiple games states and transitions, such
as turns, gem state changes, game setup and end game routines. 


See the main file, main.js for additional comments. 

*/

class Game {
    constructor(size = 5, initialDifficulty = "easy") {
        this.grid = new Grid(size, this);  
        this.player = new Player();
        this.grid.setPlayer(this.player);
        this.turn = 0;
        this.settings = new GameSettings();
        this.settings.setDifficulty(initialDifficulty);

        this.ui = new UI();  
        this.scoreManager = new ScoreManager();  

        this.ui.setDifficultyButtonHandler(() => this.chooseDifficulty());
    }

    updateScoreOnHeal(crystal, prevLevel) {
        if (prevLevel === 1 && crystal.level === 2) {
            this.scoreManager.healLevel1To2();
        } else if (prevLevel === 2 && crystal.level === 3) {
            this.scoreManager.healLevel2To3();
        } else if (prevLevel === 0 && crystal.level > 0) {
            this.scoreManager.healBlackheart();
        }
        this.ui.updateScore(this.scoreManager.getScore());
    }

    handleSuperchargedCrystal(x, y) {
        const crystal = this.grid.getCrystal(x, y);
        if (crystal && crystal.supercharged && this.player.healingClicks>0) {
            const directions = [
                [-1, 0], [1, 0], // Up and down
                [0, -1], [0, 1], // Left and right
                [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
            ];
    
            let additionalPoints = 0;
    
            directions.forEach(([dx, dy]) => {
                const adjacentX = x + dx;
                const adjacentY = y + dy;
    
                if (this.grid.isValidCoordinate(adjacentX, adjacentY)) {
                    const adjacentCrystal = this.grid.getCrystal(adjacentX, adjacentY);
    
                    if (adjacentCrystal) {
                        const prevLevel = adjacentCrystal.level;
                        if (prevLevel === 1 || prevLevel === 2 || prevLevel === 0) {
                            adjacentCrystal.heal();  // Heal the adjacent crystal
    
                            // Add points based on the level the crystal healed to
                            if (prevLevel === 1 && adjacentCrystal.level === 2) {
                                additionalPoints += 10;
                            } else if (prevLevel === 2 && adjacentCrystal.level === 3) {
                                additionalPoints += 5;
                            } else if (prevLevel === 0 && adjacentCrystal.level === 1) {
                                additionalPoints += 5;
                            }
                        }
                    }
                }
            });
    
            // After healing, the supercharged crystal should revert to level 2
            crystal.level = 2;
            crystal.supercharged = false;
            crystal.superCount = 0;
            crystal.color = crystal.getColor(); // Update the crystal's color to reflect the level change
    
            this.scoreManager.useSuperchargedCrystal(additionalPoints);
            this.ui.updateScore(this.scoreManager.getScore());
            this.grid.updateGrid();
        }
    }
    
    
    handleCrystalClick(x, y) {
        const crystal = this.grid.getCrystal(x, y);
        if (crystal) {
            const prevLevel = crystal.level;
    
            if (crystal.supercharged) {
                this.handleSuperchargedCrystal(x, y);  // Handle special case for supercharged crystals
            } else {
                this.player.healCrystal(this.grid, x, y, this.scoreManager, this.ui);  // Regular healing
            }
    
            // Update score based on healing action
            if (prevLevel === 1 && crystal.level === 2) {
                this.scoreManager.healLevel1To2();
            } else if (prevLevel === 2 && crystal.level === 3) {
                this.scoreManager.healLevel2To3();
            } else if (prevLevel === 0 && crystal.level > 0) {
                this.scoreManager.healBlackheart();
            }
    
            this.ui.updateScore(this.scoreManager.getScore());  // Update the UI to reflect the new score
        }
    }

    startGame() {
        console.log("Starting game...");
        
        document.getElementById("volumeText").disabled = false;
        document.getElementById("volumeText").hidden = false;
        document.getElementById("volumeSlider").disabled = false;
        document.getElementById("volumeSlider").hidden = false;

        this.grid.drawGrid(); // Initially draw the grid
        this.nextTurn();
    }

    endGame() {
        console.log("Game over! Final score:", this.scoreManager.getScore());
        this.ui.updateScore(this.scoreManager.getScore());  // Final score update
        // Existing end game logic to collect player name and submit score...

        document.getElementById("nextTurnButton").disabled = true;
        document.getElementById("nextTurnButton").hidden = true;

        const text = document.createElement("p");
        text.id = "player_text";
        text.innerText = "Player name:  ";
        document.getElementById("gameContainer").appendChild(text);

        const playerName = document.createElement("input");
        playerName.innerText = "";
        document.getElementById("player_text").appendChild(playerName);

        const ok = document.createElement("button");
        ok.id = "ok";
        ok.innerHTML = "OK";
        document.getElementById("player_text").appendChild(ok);

        ok.addEventListener("click", () => {
        fetch("/save", {method: "POST", body: JSON.stringify({name: playerName.value, final_score: this.scoreManager.getScore()}),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }})
        .then(function(response) {
            if(response.ok) {
                window.location.href = "/highscores";
                return;
            }
            throw new Error('Unable to upload results to server');
        })});
    }

    nextTurn() {
        this.turn++;
        console.log(`Turn ${this.turn}:`);

        if (this.turn > 10) {
            this.endGame();
            return;
        }

        this.player.resetHealingClicks();
        this.grid.applyRandomEvents(this.settings.getDifficulty());
        this.grid.updateGrid();
        this.ui.updateHealCounter(this.player.healingClicks);
        this.ui.updateScore(this.scoreManager.getScore());
        this.ui.updateRemainingTurns(10-this.turn);
    }
    

    chooseDifficulty() {
        const selectedDifficulty = prompt("Choose difficulty: easy, medium, hard", this.settings.getDifficulty());
        if (selectedDifficulty && ["easy", "medium", "hard"].includes(selectedDifficulty)) {
            this.settings.setDifficulty(selectedDifficulty);
            console.log(`Difficulty set to ${selectedDifficulty}`);
        } else {
            alert("Invalid difficulty selected.");
        }
    }

    highScores() {
        window.location.href = "/highscores";
    }
}


