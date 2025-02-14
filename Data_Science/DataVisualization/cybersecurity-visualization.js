function CyberSecurityVisualization() {
    this.name = "Cybersecurity Indexes";
    this.id = 'cybersecurity-indexes';
    this.loaded = false;
    this.regionData = {}; // To store aggregated data

    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/cybersecurity-indexes/Cyber_security.csv', 'csv', 'header', function(table) {
            self.loaded = true;
            console.log('Data loaded successfully');
        });
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Initialize regionData structure for aggregation
        const regions = ['Asia-Pasific', 'Europe', 'Africa', 'North America', 'South America'];
        regions.forEach(region => {
            this.regionData[region] = { CEI: 0, GCI: 0, NCSI: 0, DDL: 0, count: 0 };
        });

        // Aggregate data, safely handling null values
        for (let r = 0; r < this.data.getRowCount(); r++) {
            const region = this.data.getString(r, 'Region');
            if (this.regionData.hasOwnProperty(region)) {
                ['CEI', 'GCI', 'NCSI', 'DDL'].forEach(index => {
                    let value = this.data.getString(r, index);
                    value = value ? parseFloat(value) : 0; // Convert to float, default to 0 if null/undefined
                    if (!isNaN(value)) { // Check if value is not a NaN
                        this.regionData[region][index] += value;
                        if (index !== 'count') { // Only increment count for valid, non-null index values
                            this.regionData[region].count += 1;
                        }
                    }
                });
            }
        }

        // Calculate averages
        for (const region in this.regionData) {
            if (this.regionData[region].count > 0) {
                ['CEI', 'GCI', 'NCSI', 'DDL'].forEach(index => {
                    if (index !== 'count') {
                        this.regionData[region][index] /= this.regionData[region].count;
                    }
                });
            }
        }

        console.log(this.regionData);
    };

    this.draw = function() {
        // Check if data is loaded
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255); // Clear the background
        textSize(14);
        textAlign(LEFT, CENTER);

        // Layout constants
        const margin = { top: 30, right: 30, bottom: 80, left: 100 };
        const barHeight = 20;
        const gapBetweenBars = 10;
        const regionGap = 40; // Space between each region group
        let y = margin.top;

        // Calculate the maximum bar width based on the largest average value
        let maxValue = 0;
        Object.values(this.regionData).forEach(region => {
            maxValue = Math.max(maxValue, region.CEI, region.GCI, region.NCSI, region.DDL);
        });
        const scalingFactor = (width - margin.left - margin.right) / maxValue;

        // Function to draw a single bar
        const drawBar = (x, y, value, label, color) => {
            fill(color);
            noStroke();
            const barWidth = value * scalingFactor;
            rect(x, y, barWidth, barHeight);
            fill(0);
            text(label, x + barWidth + 5, y + barHeight / 2); // Label to the right of the bar
        };

        // Iterate over regions to draw bars
        Object.keys(this.regionData).forEach(region => {
            const xStart = margin.left;
            let x = xStart;
            const data = this.regionData[region];

            // Draw region label on the y-axis
            fill(0);
            noStroke();
            textAlign(RIGHT, CENTER);
            text(region, xStart - 10, y + barHeight / 2);

            // Draw bars for each index
            textAlign(LEFT, CENTER);
            drawBar(x, y, data.CEI, 'CEI', 'red');
            y += barHeight + gapBetweenBars;
            drawBar(x, y, data.GCI, 'GCI', 'green');
            y += barHeight + gapBetweenBars;
            drawBar(x, y, data.NCSI, 'NCSI', 'blue');
            y += barHeight + gapBetweenBars;
            drawBar(x, y, data.DDL, 'DDL', 'orange');

            // Adjust y for the next region group
            y += regionGap;
        });
    };

}

