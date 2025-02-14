function AppleQuality() {
    this.name = "Apple Quality";
    this.id = 'apple-quality';
    this.loaded = false;
    this.goodCount = 0;
    this.badCount = 0;

    this.preload = function () {
        var self = this;
        this.data = loadTable('./data/apples-quality-percentage/apple_quality.csv', 'csv', 'header', function(table) {
            self.loaded = true;
        });
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        
        // Counting good and bad apples
        for (let r = 0; r < this.data.getRowCount(); r++) {
            const quality = this.data.getString(r, "Quality");
            if (quality === 'good') {
                this.goodCount++;
            } else if (quality === 'bad') {
                this.badCount++;
            }
        }
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255); // Clear the background to ensure a clean redraw
        const totalApples = this.goodCount + this.badCount;
        const displayWidth = width; // Use canvas width
        const displayHeight = height - 60; // Reserve space for the title
        const cellSize = Math.min(displayWidth, displayHeight) / 10;

        const goodPercentage = (this.goodCount / totalApples) * 100;
        const badPercentage = (this.badCount / totalApples) * 100;
        let goodRectangles = Math.ceil(goodPercentage);
        let badRectangles = Math.floor(badPercentage);

        if (goodRectangles + badRectangles > 100) {
            badRectangles = 100 - goodRectangles;
        }

        let hoverText = '';

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                let index = i * 10 + j;
                let x = j * cellSize;
                let y = i * cellSize;

                if (index < goodRectangles) {
                    fill('green');
                    if (mouseX > x && mouseX < x + cellSize && mouseY > y && mouseY < y + cellSize) {
                        hoverText = 'Good Apples: ' + goodPercentage.toFixed(2) + '%';
                    }
                } else if (index < goodRectangles + badRectangles) {
                    fill('red');
                    if (mouseX > x && mouseX < x + cellSize && mouseY > y && mouseY < y + cellSize) {
                        hoverText = 'Bad Apples: ' + badPercentage.toFixed(2) + '%';
                    }
                }

                rect(x, y, cellSize, cellSize);
            }
        }

        // Draw hover text
        if (hoverText !== '') {
            fill(0);
            textSize(16);
            text(hoverText, mouseX, mouseY - 15);
        }

        // Draw title below the grid
        fill(0);
        textSize(20);
        textAlign(CENTER, TOP);
        text('Percentage of Good Apples to Bad Apples', displayWidth / 2, displayHeight + 5);
    };

}

        