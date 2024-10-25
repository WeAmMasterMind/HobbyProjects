/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: Grid
This class is used to setup the game board, which is a grid of n lines by m columns, 
and to draw it positioning the proper gems images in each turn of the game as required
by their current state. 
It is also used to apply random transitions to gem states as required by turn change. 

See the main file, main.js for additional comments. 

*/

class Grid {
    constructor(size = 5, game) {
        this.size = size;
        this.game = game;
        this.crystals = this.initializeGrid();
        this.player = null;
    }

    setPlayer(player) {
        this.player = player;
    }

    initializeGrid() {
        const grid = [];
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                const crystal = new CrystalHearts();
                crystal.x = i; // Store coordinates in the crystal object
                crystal.y = j; // Store coordinates in the crystal object
                row.push(crystal);
            }
            grid.push(row);
        }
        return grid;
    }

    drawGrid() {
        const gridContainer = document.getElementById("gridContainer");
        gridContainer.innerHTML = ""; // Clear the grid container

        this.crystals.forEach((row, rowIndex) => {
            row.forEach((crystal, colIndex) => {
                const crystalElement = document.createElement("img");
                crystalElement.src = crystal.color;
                crystalElement.classList.add("crystal");
                crystalElement.setAttribute("data-x", rowIndex);
                crystalElement.setAttribute("data-y", colIndex);
                crystalElement.addEventListener("click", () => {
                    this.handleCrystalClick(rowIndex, colIndex);
                });
                gridContainer.appendChild(crystalElement);
            });
        });
    }

    getCrystal(x, y) {
        if (this.isValidCoordinate(x, y)) {
            return this.crystals[x][y];
        } else {
            console.log("Invalid coordinates");
            return null;
        }
    }

    updateGrid() {
        this.crystals.forEach((row, rowIndex) => {
            row.forEach((crystal, colIndex) => {
                const crystalElement = document.querySelector(`img[data-x="${rowIndex}"][data-y="${colIndex}"]`);
                if (crystalElement) {
                    crystalElement.src = crystal.color;
                }
            });
        });
    }

    applyDamage(x, y) {
        const crystal = this.getCrystal(x, y);
        if (crystal) {
            crystal.damage();
            this.updateGrid();
        }
    }

    applyHealing(x, y) {
        const crystal = this.getCrystal(x, y);
        if (crystal) {
            crystal.heal();
            crystal.areaHeal(this, x, y); // Check for area heal if supercharged
            this.updateGrid();
        }
    }

    handleCrystalClick(x, y) {
        this.game.handleCrystalClick(x, y);  // Delegate the click handling to the Game class

        var touchSound = document.getElementById("touchSound"); 
        touchSound.play(); 
    }

    applyRandomEvents(difficulty) {
        let damageInstances, healingInstances;
        switch (difficulty) {
            case "easy":
                damageInstances = 12;
                healingInstances = 3;
                break;
            case "medium":
                damageInstances = 12;
                healingInstances = 2;
                break;
            case "hard":
                damageInstances = 15;
                healingInstances = 1;
                break;
            default:
                damageInstances = 12;
                healingInstances = 3;
        }
    
        const damagePositions = this.getRandomPositions(damageInstances);
        const healingPositions = this.getRandomPositions(healingInstances);
    
        damagePositions.forEach(([x, y]) => {
            const crystal = this.getCrystal(x, y);
            if (crystal) {
                const prevLevel = crystal.level;
                crystal.damage();  // Damage the crystal
    
                // If the crystal falls to level 0, update the score
                if (prevLevel === 1 && crystal.level === 0) {
                    this.game.scoreManager.fallToLevel0(); 
                    this.game.ui.updateScore(this.game.scoreManager.getScore());  
                }
            }
        });
    
        healingPositions.forEach(([x, y]) => {
            const crystal = this.getCrystal(x, y);
            if (crystal) {
                crystal.heal();
                crystal.areaHeal(this, x, y); // Apply area heal if supercharged
            }
        });
    
        this.updateGrid();
    }    

    //
    // Select a few gems randomly for healing and damaging
    //
    getRandomPositions(numPositions) {
        const position_array = [];
        let positions = [];

        // Create array with all positions
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                position_array.push([col,row]);
            }
        }

        position_array.sort(() => .5 - Math.random());
        positions = position_array.slice(0,numPositions);
        return positions;
    }

    isValidCoordinate(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
}







