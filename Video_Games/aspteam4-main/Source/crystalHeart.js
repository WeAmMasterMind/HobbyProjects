/*

University of London
BsC Computer Science
Agile Software Project 
Crystal Hearts Game

Davide Basile
Wiam Ghousaini 
Nelson Waissman

Class: CrystalHeart
This class is used to create each crystal used in the game, manage the crystal's state,
draw it on the board in their correct position

See the main file, main.js for additional comments. 

*/

//CrystalHearts class
class CrystalHearts {
    constructor(level = 3) {
        this.level = level;
        this.color = this.getColor();
        this.supercharged = false;
        this.damaged = false;
        this.superCount = 0;
        this.zeroCount = 0;
    }

    getColor() {
        switch (this.level) {
            case 0:
                return "./assets/14.png"; // Path to black heart image
            case 1:
                return "./assets/00.png"; // Path to red crystal image
            case 2:
                return "./assets/01.png"; // Path to orange crystal image
            case 3:
                return "./assets/02.png"; // Path to yellow crystal image
            case 4:
                return "./assets/11.png"; // Path to green crystal image (supercharged)
            default:
                console.log("No such crystal exists");
                return "";
        }
    }

    heal() {
        if (this.supercharged) {
            console.log("It's already supercharged!");
            return;
        }
        if (this.level === 3) {
            this.superCount++;
            if (this.superCount === 2) { // Supercharge after 2 clicks
                this.level = 4;
                this.supercharged = true;
                this.color = this.getColor();
            }
        } else if (this.level > 0 && this.level < 3) {
            this.level++;
            this.color = this.getColor();
        // } else if (this.level === 0 && this.damaged) {
        } else if (this.level === 0) {
            this.zeroCount++;
            if (this.zeroCount === 2) {
                this.level = 1;
                this.color = this.getColor();
                // this.damaged = false; // Reset damaged state
                this.zeroCount = 0; // Reset zero count
            }
        }
    }

    damage() {
        if (this.level === 3) {
            if (this.superCount === 0) {
                this.level--;
                this.color = this.getColor();
            } else {
                this.superCount--;
            }
        } else if (this.level === 2 || this.level === 1) {
            this.level--;
            this.color = this.getColor();
            // if (this.level === 1) {
            //    this.damaged = true;
            // }
        // } else if (this.level === 0) {
        //     this.damaged = true;
        }
    }

    areaHeal(grid, x, y) {
        if (this.level === 4) { // If the crystal is supercharged
            const directions = [
                [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
                [-1, -1], [1, 1], [-1, 1], [1, -1] // Diagonal directions
            ];
            directions.forEach(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                if (grid.isValidCoordinate(nx, ny)) {
                    const neighbor = grid.getCrystal(nx, ny);
                    if (neighbor) {
                        neighbor.heal(); // Heal adjacent crystals
                    }
                }
            });
            // Revert the supercharged crystal back to level 2 after use
            this.level = 2;
            this.supercharged = false; // It is no longer supercharged
            this.superCount = 0; // Reset supercharge counter
            this.color = this.getColor(); // Update color to reflect the level change
            grid.updateGrid(); // Ensure the grid is updated visually
        }
    }
}



    







