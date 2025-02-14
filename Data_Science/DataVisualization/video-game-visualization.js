function VideoGameVisualization() {
    this.name = "Video Game Sales Visualization";
    this.id = 'video-game-visualization';
    this.loaded = false;
    this.publisherData = {};
    this.dropdown = null;

    // Placeholder for the PieChart instance; assumes PieChart is defined elsewhere
    this.pie = null;

    this.preload = function() {
        // Load your CSV data; ensure you have the p5.js library loaded for loadTable to work
        this.data = loadTable('./data/video-games/Video_Games.csv', 'csv', 'header', () => {
            this.loaded = true;
            console.log('Video game data loaded successfully');
        });
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Process and aggregate data
        for (let r = 0; r < this.data.getRowCount(); r++) {
            const publisher = this.data.getString(r, 'Publisher');
            const globalSales = parseFloat(this.data.getString(r, 'Global_Sales')) || 0;

            if (!this.publisherData[publisher]) {
                this.publisherData[publisher] = {
                    count: 1,
                    globalSales: globalSales,
                    NA_Sales: parseFloat(this.data.getString(r, 'NA_Sales')) || 0,
                    EU_Sales: parseFloat(this.data.getString(r, 'EU_Sales')) || 0,
                    JP_Sales: parseFloat(this.data.getString(r, 'JP_Sales')) || 0,
                    Other_Sales: parseFloat(this.data.getString(r, 'Other_Sales')) || 0,
                };
            } else {
                this.publisherData[publisher].count += 1;
                this.publisherData[publisher].globalSales += globalSales;
                this.publisherData[publisher].NA_Sales += parseFloat(this.data.getString(r, 'NA_Sales')) || 0;
                this.publisherData[publisher].EU_Sales += parseFloat(this.data.getString(r, 'EU_Sales')) || 0;
                this.publisherData[publisher].JP_Sales += parseFloat(this.data.getString(r, 'JP_Sales')) || 0;
                this.publisherData[publisher].Other_Sales += parseFloat(this.data.getString(r, 'Other_Sales')) || 0;
            }
        }

        // Setup dropdown for publisher selection
        this.dropdown = createSelect();
        this.dropdown.position(350, 10);
        Object.keys(this.publisherData).forEach(publisher => {
            this.dropdown.option(publisher);
        });
        this.dropdown.changed(() => this.drawSelectedPublisher());

        // Initialize the PieChart for later use
        this.pie = new PieChart(width / 2, height / 2, width * 0.4);
    };

    this.drawSelectedPublisher = function() {
        clear(); // Clear the canvas for redrawing
        background(255); // Set background color

        const publisher = this.dropdown.value();
        const data = this.publisherData[publisher];

        // Assuming PieChart class/function takes parameters: x, y, diameter, data, labels, colors, title
        const salesData = [data.NA_Sales, data.EU_Sales, data.JP_Sales, data.Other_Sales];
        const labels = ['NA', 'EU', 'JP', 'Other'];
        const colors = ['blue', 'red', 'green', 'yellow'];
        const title = `${publisher} Sales Distribution`;

        // Draw the pie chart
        this.pie.draw(salesData, labels, colors, title); 

    };
}

