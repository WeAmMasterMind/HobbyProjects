// Variables for table and balls
let tableWidth, tableHeight, canvasWidth, canvasHeight;
let ballDiameter, pocketDiameter;
let balls = [];
let cueBall;
let isDragging = false;
let score1 = 0, score2 = 0;
let currentPlayer = 1;
let mode = "practice";
let isSettingCueBall = true; // Default to manual placement mode at the start of the game
let lastValidCueBallPosition; // Store last valid position of cueBall
let gameState = "selectMode"; // Game states: selectMode, setupBalls, placeCueBall, playing
let isShotActive = false; // Track active turn
let shotStarted = false; // Tracks if the shot has started
let shotFinished = false; // Track if the shot has completed
let playerScored = false; // Tracks if the current player scored
let cueBallFoul = false;  // Tracks if the cue ball was fouled
let turnFinalized = false;
let shotInitiated = false;
let cueBallMoved = false;
let cueBallPocketed = false; // Tracks if the cue ball is pocketed



// Physics engine variables
let engine, world;

function setup() {
    canvasWidth = 1000;
    canvasHeight = 600;
    tableWidth = canvasWidth * 0.8;
    tableHeight = tableWidth / 2;

    ballDiameter = tableWidth / 45;
    pocketDiameter = ballDiameter * 2;

    createCanvas(canvasWidth, canvasHeight);
    
    //Initialize Matter.js engine and world
    engine = Matter.Engine.create();
    world = engine.world;
    
    // Disable gravity
    engine.world.gravity.y = 0;
    
    gameState = "selectMode";
    console.log("Setup complete. Awaiting game mode selection.");
    
    //Initialize table, boundaries, balls
    initializeBoundaries();    
    initializeBalls();
    initializeCueBall();   
}



function draw() {
    Matter.Engine.update(engine);
    background(0);
    
    // Draw table first
    drawTable();
       
    switch (gameState) {
        case "selectMode":
            displayModeSelection();
            break;
        case "setupBalls":
            setupBalls();
            break;
        case "placeCueBall":
            displayPlacementMode();
            break;
        case "playing":
            runGame();
            break;
    }
}

//-------------------------- Table Related Logic -----------------
function drawTable() {
    // Draw wooden frame
    fill(139, 69, 19); // Brown color for wood
    rectMode(CENTER);
    noStroke(); // Disable any strokes
    rect(width / 2, height / 2, tableWidth + 40, tableHeight + 40, 10); // Outer frame

    // Draw table felt (green area)
    fill(34, 139, 34); // Green felt
    rect(width / 2, height / 2, tableWidth, tableHeight, 10); // Inner playing area

    // Add cushion bevels
    let cushionWidth = 15;
    fill(0, 100, 0); // Darker green for cushions
    rect(width / 2 - tableWidth / 2, height / 2, cushionWidth, tableHeight); // Left cushion
    rect(width / 2 + tableWidth / 2, height / 2, cushionWidth, tableHeight); // Right cushion
    rect(width / 2, height / 2 - tableHeight / 2, tableWidth, cushionWidth); // Top cushion
    rect(width / 2, height / 2 + tableHeight / 2, tableWidth, cushionWidth); // Bottom cushion

    // Draw pockets with depth
    fill(0); // Black color for pockets
    ellipse((width / 2 - tableWidth / 2) * 1.07, (height / 2 - tableHeight / 2) * 1.07, pocketDiameter); // Top-left
    ellipse((width / 2 + tableWidth / 2) * 0.995, (height / 2 - tableHeight / 2) * 1.07, pocketDiameter); // Top-right
    ellipse((width / 2 - tableWidth / 2) * 1.07, (height / 2 + tableHeight / 2) * 0.99, pocketDiameter); // Bottom-left
    ellipse((width / 2 + tableWidth / 2) * 0.99, (height / 2 + tableHeight / 2) * 0.99, pocketDiameter); // Bottom-right
    ellipse(width / 2, height / 2 - tableHeight / 2, pocketDiameter); // Top-center
    ellipse(width / 2, height / 2 + tableHeight / 2, pocketDiameter); // Bottom-center

    // Draw pocket shadows
    fill(50); // Dark grey shadow
    ellipse((width / 2 - tableWidth / 2) * 1.07, (height / 2 - tableHeight / 2) * 1.07, pocketDiameter * 0.8);
    ellipse((width / 2 + tableWidth / 2) * 0.995, (height / 2 - tableHeight / 2) * 1.07, pocketDiameter * 0.8);
    ellipse((width / 2 - tableWidth / 2) * 1.07, (height / 2 + tableHeight / 2) * 0.99, pocketDiameter * 0.8);
    ellipse((width / 2 + tableWidth / 2) * 0.99, (height / 2 + tableHeight / 2) * 0.99, pocketDiameter * 0.8);
    ellipse(width / 2, height / 2 - tableHeight / 2, pocketDiameter * 0.8);
    ellipse(width / 2, height / 2 + tableHeight / 2, pocketDiameter * 0.8);

    // Draw "D" zone only if needed
    stroke(255); // White stroke for "D"
    noFill();
    let dRadius = tableWidth / 10;
    let dCenterX = width / 2 - tableWidth / 2 + dRadius * 2.5;
    let dCenterY = height / 2;

    // Draw semi-circle for "D"
    arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, PI / 2, -PI / 2);

    // Draw the straight line at the base of the "D"
    line(dCenterX, dCenterY - dRadius, dCenterX, dCenterY + dRadius);

    // Reset stroke to avoid affecting other elements
    noStroke();
    
}

// Initialize cushion collision detection
function initializeBoundaries() {
    const options = { 
        isStatic: true, 
        restitution: 1, // Perfectly elastic collisions
        friction: 0,
        
    };

    // Left wall
    const leftWall = Matter.Bodies.rectangle(
        width / 2 - tableWidth / 2 - 7.5, // Offset by half thickness
        height / 2,
        15, // Thickness
        tableHeight,
        options
    );

    // Right wall
    const rightWall = Matter.Bodies.rectangle(
        width / 2 + tableWidth / 2 + 7.5, // Offset by half thickness
        height / 2,
        15, // Thickness
        tableHeight,
        options
    );

    // Top wall
    const topWall = Matter.Bodies.rectangle(
        width / 2,
        height / 2 - tableHeight / 2 - 7.5, // Offset by half thickness
        tableWidth,
        15, // Thickness
        options
    );

    // Bottom wall
    const bottomWall = Matter.Bodies.rectangle(
        width / 2,
        height / 2 + tableHeight / 2 + 7.5, // Offset by half thickness
        tableWidth,
        15, // Thickness
        options
    );

    // Add walls to the physics world
    Matter.World.add(world, [leftWall, rightWall, topWall, bottomWall]);
    console.log("Boundaries initialized.");
}

// Slows Balls when they get closer to pockets
function applyPocketDamping(ball) {
    let pockets = [
        { x: (width / 2 - tableWidth / 2) * 1.07, y: (height / 2 - tableHeight / 2) * 1.07 },
        { x: (width / 2 + tableWidth / 2) * 0.995, y: (height / 2 - tableHeight / 2) * 1.07 },
        { x: (width / 2 - tableWidth / 2) * 1.07, y: (height / 2 + tableHeight / 2) * 0.99 },
        { x: (width / 2 + tableWidth / 2) * 0.99, y: (height / 2 + tableHeight / 2) * 0.99 },
        { x: width / 2, y: height / 2 - tableHeight / 2 },
        { x: width / 2, y: height / 2 + tableHeight / 2 }
    ];

    let dampingRadius = pocketDiameter * 0.991; 
    for (let pocket of pockets) {
        let distToPocket = dist(ball.body.position.x, ball.body.position.y, pocket.x, pocket.y);

        if (distToPocket < dampingRadius && !ball.body.isSleeping) {
            console.log('Ball at (${ball.bdy.position.x}, ${ball.body.position.y})is near pocket (${pocket.x}, ${pocket.y}). Applying damping.');
            Matter.Body.setVelocity(ball.body, {
                x: ball.body.velocity.x * 0.99, // Reduce velocity by 10% per frame
                y: ball.body.velocity.y * 0.99
            });
        }
    }
}

// Check balls entering pockets
function checkPockets() {
    // Define pocket positions
    let pockets = [
        { x: (width / 2 - tableWidth / 2) * 1.07, y: (height / 2 - tableHeight / 2) * 1.07 }, // Top-left
        { x: (width / 2 + tableWidth / 2) * 0.995, y: (height / 2 - tableHeight / 2) * 1.07 }, // Top-right
        { x: (width / 2 - tableWidth / 2) * 1.07, y: (height / 2 + tableHeight / 2) * 0.99 }, // Bottom-left
        { x: (width / 2 + tableWidth / 2) * 0.99, y: (height / 2 + tableHeight / 2) * 0.99 }, // Bottom-right
        { x: width / 2, y: height / 2 - tableHeight / 2 },                                  // Top-center
        { x: width / 2, y: height / 2 + tableHeight / 2 }                                   // Bottom-center
    ];

    let detectionRadius = pocketDiameter * 0.8;

    // Check if any ball is in a pocket
    for (let i = balls.length - 1; i >= 0; i--) {
        let ball = balls[i];
        let ballPos = ball.body.position;

        for (let pocket of pockets) {
            let distToPocket = dist(ballPos.x, ballPos.y, pocket.x, pocket.y);

            if (distToPocket < detectionRadius) {
                handlePocketedBall(ball, i);
                break;
            }
        }
    }

    // Check if the cue ball falls into a pocket
    let cueBallPos = cueBall.body.position;
    for (let pocket of pockets) {
        let distToPocket = dist(cueBallPos.x, cueBallPos.y, pocket.x, pocket.y);

        if (distToPocket < detectionRadius) {
            console.log("Cue ball fell into a pocket.");
            cueBallPocketed = true; // Set the cue ball pocketed flag
            resetCueBall(); // Allow repositioning of the cue ball
            break;
        }
    }
}

// Function to handle pocketed balls
function handlePocketedBall(ball, index) {
    Matter.World.remove(world, ball.body);
    balls.splice(index, 1);

    if (ball.color === "white") {
        console.log("Cue ball pocketed. Foul!");
        resetCueBall(); // Let the player reposition the cue ball in the D zone
        if (mode === "multiplayer") {
            playerScored = false; // Foul means no score
            switchTurn(); // Foul switches the turn in multiplayer mode
        }
        return;
    }

    updateScore(ball); // Update score for the pocketed ball
    console.log(`Pocketed ${ball.color} ball.`);
    playerScored = true; // Set flag to true since the player scored
}

//----------------- Phase 1: GameMode Selection ------------------

// Display Mode Selection
function displayModeSelection() {
    fill(255);
    textSize(24);
    textAlign(CENTER);
    text("Select Game Mode", width / 2, height / 2 - 50);
    text("1. Practice", width / 2, height / 2);
    text("2. Randomized All Balls", width / 2, height / 2 + 30);
    text("3. Randomized Red Balls", width / 2, height / 2 + 60);
    text("4. Multiplayer", width / 2, height / 2 + 90);
}

// Key Press Logic
function keyPressed() {
    if (gameState === "selectMode") {
        switch (key) {
            case "1":
                mode = "practice";
                startPracticeMode();
                break;
            case "2":
                mode = "randomizedAll";
                startRandomizedAllMode();
                break;
            case "3":
                mode = "randomizedReds";
                startRandomizedRedMode();
                break;
            case "4":
                mode = "multiplayer";
                startMultiplayerMode();
                break;
            default:
                console.log("Invalid mode selection.");
                return; // Exit early if invalid key is pressed
        }
        gameState = "setupBalls"; // Transition to setupBalls state
        console.log(`Mode selected: ${mode}`);
    } else if (gameState === "placeCueBall") {
        handleCueBallPlacement();
        if (key === "Enter" || key === " ") {
            finalizeCueBallPlacement();
        }
    }
}

//--------------- Phase 2: SetupBalls Mode --------------------------

function setupBalls() {
    console.log(`Setting up balls for mode: ${mode}`);
    resetWorld(); // Clear the physics world to avoid duplicates

    // Set up balls based on the selected mode
    switch (mode) {
        case "practice":
            initializeStandardBalls(); // Set up standard ball arrangement
            break;
        case "randomizedAll":
            randomizeAllBalls(); // Place all balls randomly
            break;
        case "randomizedReds":
            randomizeRedBallsOnly(); // Randomize red balls while keeping colored ones fixed
            break;
        case "multiplayer":
            initializeStandardBalls(); // Use standard arrangement for multiplayer
            break;
        default:
            console.error(`Unknown mode: ${mode}`);
            return;
    }

    finalizeBallSetup(); // Set all balls to dynamic and ready for gameplay
    initializeCueBall();
    
    if(cueBall){
        gameState = "placeCueBall"; // Transition to cue ball placement phase
        console.log("Balls initialized and ready for cue ball placement.");
    }else {
        console.error("Failed to initialize cueball.");
    }
}

//Different modes to select from
function startPracticeMode() {
    console.log("Starting Practice Mode");
    mode = "practice"; // Set mode to "practice"
    gameState = "setupBalls"; // Transition to the setup phase
}

function startRandomizedAllMode() {
    console.log("Starting Randomized All Balls Mode");
    mode = "randomizedAll"; // Set mode to "randomizedAll"
    gameState = "setupBalls"; // Transition to the setup phase
}

function startRandomizedRedMode() {
    console.log("Starting Randomized Red Balls Mode");
    mode = "randomizedReds"; // Set mode to "randomizedReds"
    gameState = "setupBalls"; // Transition to the setup phase
}

function startMultiplayerMode() {
    console.log("Starting Multiplayer Mode");
    mode = "multiplayer";
    score1 = 0; // Reset scores
    score2 = 0;
    currentPlayer = 1; // Player 1 starts
    playerScored = false; // Reset scoring flag
    gameState = "setupBalls"; // Transition to the setup phase
}

// Initialization after modes are chosen
function initializeStandardBalls() {
    console.log("Initializing standard balls...");
    balls = [];
    createRedBalls(); // Arrange red balls in triangular formation
    createColoredBalls(); // Place colored balls in their standard positions
    console.log("Standard balls initialized.");
}

// Randomize All Balls
function randomizeAllBalls() {
    balls = [];
    randomizeBalls(["red", "yellow", "green", "blue", "pink", "black", "brown"], 21);
}

// Randomize Only Red Balls
function randomizeRedBallsOnly() {
    balls = []; // Clear all existing balls to start fresh

    // Place 15 red balls randomly
    for (let i = 0; i < 15; i++) {
        let x, y;
        do {
            x = random(
                width / 2 - tableWidth / 2 + ballDiameter,
                width / 2 + tableWidth / 2 - ballDiameter
            );
            y = random(
                height / 2 - tableHeight / 2 + ballDiameter,
                height / 2 + tableHeight / 2 - ballDiameter
            );
        } while (!isValidPosition(x, y, balls, ballDiameter * 1.1));

        balls.push(new Ball(x, y, ballDiameter, "red", true)); // Add red ball
    }

    // Add colored balls in their standard positions (no randomization)
    createColoredBalls(); // This ensures no duplicates for colored balls
}

// Modes Helper Functions
// Randomize all balls positions
function randomizeAllBallPositions() {
    balls = []; // Clear existing balls
    randomizeBalls("red", 15); // Randomize 15 red balls
    randomizeBalls(["yellow", "green", "blue", "pink", "black", "brown"], 6); // Randomize other colors
}


// Randomize Ball Placement
function randomizeBalls() {
    const redCount = 15; // Number of red balls
    const coloredBalls = ["yellow", "green", "blue", "pink", "black", "brown"]; // List of colored balls
    balls = []; // Clear existing balls

    // Place 15 red balls
    for (let i = 0; i < redCount; i++) {
        let x, y;
        do {
            x = random(
                width / 2 - tableWidth / 2 + ballDiameter,
                width / 2 + tableWidth / 2 - ballDiameter
            );
            y = random(
                height / 2 - tableHeight / 2 + ballDiameter,
                height / 2 + tableHeight / 2 - ballDiameter
            );
        } while (!isValidPosition(x, y, balls, ballDiameter * 1.1));

        balls.push(new Ball(x, y, ballDiameter, "red", true)); // Add red ball
    }

    // Place 6 colored balls
    for (let color of coloredBalls) {
        let x, y;
        do {
            x = random(
                width / 2 - tableWidth / 2 + ballDiameter,
                width / 2 + tableWidth / 2 - ballDiameter
            );
            y = random(
                height / 2 - tableHeight / 2 + ballDiameter,
                height / 2 + tableHeight / 2 - ballDiameter
            );
        } while (!isValidPosition(x, y, balls, ballDiameter * 1.1));

        balls.push(new Ball(x, y, ballDiameter, color, true)); // Add colored ball
    }

    console.log(`Randomized balls: ${balls.length} total`);
}

//-------------------- Phase 3: CueBall Placement --------------------

// Cue Ball Initialization
function initializeCueBall() {
    console.log("Initializing cue bal...");
    let dRadius = tableWidth / 10;
    let dCenterX = width / 2 - tableWidth / 2 + dRadius * 2;
    let dCenterY = height / 2;

    cueBall = new Ball(dCenterX, dCenterY, ballDiameter, "white", false);
    lastValidCueBallPosition = { x: dCenterX, y: dCenterY };
    isSettingCueBall = true;
    console.log("Cue Ball Initialized:", cueBall.body.position);
}

// Display Cue Ball Placement Mode
function displayPlacementMode() {
    fill(255);
    textSize(24);
    textAlign(CENTER);
    text("Place the Cue Ball", width / 2, 30);
    text("Use arrow keys to move, press Enter to finalize", width / 2, 60);

    if (cueBall) {
        console.log("Displaying cue ball at:", cueBall.body.position);
        cueBall.show(); // Draw the cue ball
    } else {
        console.error("Cue ball is not defined in placement mode.");
    }
}

// Use keyboard arrows for placement
function handleCueBallPlacement() {
    let dRadius = tableWidth / 10;
    let dCenterX = width / 2 - tableWidth / 2 + dRadius * 2;
    let dCenterY = height / 2;
    let step = 5;

    if (keyCode === UP_ARROW) {
        let newY = cueBall.body.position.y - step;
        if (dist(cueBall.body.position.x, newY, dCenterX, dCenterY) <= dRadius) {
            Matter.Body.setPosition(cueBall.body, { x: cueBall.body.position.x, y: newY });
        }
    } else if (keyCode === DOWN_ARROW) {
        let newY = cueBall.body.position.y + step;
        if (dist(cueBall.body.position.x, newY, dCenterX, dCenterY) <= dRadius) {
            Matter.Body.setPosition(cueBall.body, { x: cueBall.body.position.x, y: newY });
        }
    } else if (keyCode === LEFT_ARROW) {
        let newX = cueBall.body.position.x - step;
        if (dist(newX, cueBall.body.position.y, dCenterX, dCenterY) <= dRadius) {
            Matter.Body.setPosition(cueBall.body, { x: newX, y: cueBall.body.position.y });
        }
    } else if (keyCode === RIGHT_ARROW) {
        let newX = cueBall.body.position.x + step;
        if (dist(newX, cueBall.body.position.y, dCenterX, dCenterY) <= dRadius) {
            Matter.Body.setPosition(cueBall.body, { x: newX, y: cueBall.body.position.y });
        }
    } else if (key === "Enter" || key === " ") {
        finalizeCueBallPlacement();
    }
}

// Finalize Cue Ball Placement
function finalizeCueBallPlacement() {
    console.log("Finalizing cue ball placement...");
    if (isValidPosition(cueBall.body.position.x, cueBall.body.position.y, balls, ballDiameter * 1.1)) {
        isSettingCueBall = false;
        Matter.Body.setStatic(cueBall.body, false);
        Matter.Body.set(cueBall.body, { mass: 1 });
        gameState = "playing";
        console.log("cue ball placement finalized. Starting Game...");
    } else {
        console.log("Cue ball overlaps with another ball. Adjust position.");
    }
}

//--------------------------- Phase 4: Gameplay Loop --------------------------
// Gameplay
function runGame() {
    displayScoreboard();
    displayGameInfo();
    drawTable();

    for (let ball of balls) {
        ball.show();
        applyPocketDamping(ball);
    }

    cueBall.show();
    applyPocketDamping(cueBall);
    checkPockets();
    
    // Track the last valid position of the cue ball
    const cuePos = cueBall.body.position;
    if (isValidPosition(cuePos.x, cuePos.y, balls, ballDiameter * 1.1)) {
        lastValidCueBallPosition = { x: cuePos.x, y: cuePos.y };
    }

    if (isDragging) {
        drawCueStick();
    }

    // Detect when the cue ball moves after the shot
    const cueVelocity = cueBall.body.velocity;
    if (shotInitiated && !cueBallMoved) {
        if (Math.sqrt(cueVelocity.x ** 2 + cueVelocity.y ** 2) > 0.1) {
            cueBallMoved = true; // Cue ball has started moving
        }
    }

    // Check if the shot is complete (all balls stationary)
    if (shotInitiated && cueBallMoved && isShotComplete()) {
        finalizeTurn(); // Finalize the turn
        resetShotTracking(); // Reset shot-related tracking
    }
}


//----------------------- Extra GameLoop Functions -------------------------------------
// Display Game Info
function displayGameInfo() {
    fill(255);
    textSize(20);
    text(`Mode: ${mode}`, 10, 30);
}

// Draw Cue Stick
function drawCueStick() {
    stroke(255, 255, 0);
    strokeWeight(4);
    line(cueBall.body.position.x, cueBall.body.position.y, mouseX, mouseY);

    let power = dist(cueBall.body.position.x, cueBall.body.position.y, mouseX, mouseY);
    fill(255);
    noStroke();
    textSize(16);
    text(`Power: ${Math.round(power)}`, 10, 150);
}

function resetCueBall() {
    console.log("Cue ball repositioning mode activated. Place the cue ball in the D zone.");
    isSettingCueBall = true; // Allow manual placement

    // Reset cue ball to default D zone position
    let dRadius = tableWidth / 10;
    let dCenterX = width / 2 - tableWidth / 2 + dRadius * 2;
    let dCenterY = height / 2;

    Matter.Body.setPosition(cueBall.body, { x: dCenterX, y: dCenterY });
    Matter.Body.setVelocity(cueBall.body, { x: 0, y: 0 });
    lastValidCueBallPosition = { x: dCenterX, y: dCenterY }; // Update last valid position
    gameState = "placeCueBall"; // Switch to placement mode
}


function mousePressed() {
    if (cueBall && dist(mouseX, mouseY, cueBall.body.position.x, cueBall.body.position.y) < ballDiameter / 2) {
        isDragging = true;
    }
}
function mouseReleased() {
    if (isDragging && gameState === "playing") {
        isDragging = false; // Stop dragging
        shotInitiated = true; // Mark the shot as initiated

        let dx = cueBall.body.position.x - mouseX;
        let dy = cueBall.body.position.y - mouseY;
        let distance = dist(cueBall.body.position.x, cueBall.body.position.y, mouseX, mouseY);

        if (distance > 0) {
            let maxForce = 0.05; // Increased maximum force for stronger shots
            let forceMultiplier = 0.02; // Scales how drag distance translates into force
            let forceMagnitude = min(distance * forceMultiplier, maxForce);

            // Calculate the force vector
            let force = { 
                x: (dx / distance) * forceMagnitude, 
                y: (dy / distance) * forceMagnitude 
            };

            // Apply the force to the cue ball
            Matter.Body.setStatic(cueBall.body, false); // Allow cue ball to move
            Matter.Body.applyForce(cueBall.body, cueBall.body.position, force);

            // Log the applied force for debugging
            console.log("Force applied to cue ball:", force);
        }
    }
}


function resetWorld() {
    Matter.World.clear(world);
    engine = Matter.Engine.create();
    world = engine.world;
    world.gravity.y = 0;

    console.log("World reset. All objects cleared and engine reinitialized.");

    initializeBoundaries();
    console.log("Boundaries Initialized...");
}

//-------------------------- Multiplayer Mode ------------------------

// Function to update the score based on ball color
function updateScore(ball) {
    const points = {
        red: 1,
        yellow: 2,
        green: 3,
        brown: 4,
        blue: 5,
        pink: 6,
        black: 7
    };

    let ballScore = points[ball.color] || 0; // Get score for the ball's color

    if (mode === "multiplayer") {
        if (currentPlayer === 1) {
            score1 += ballScore;
        } else {
            score2 += ballScore;
        }
        console.log(`Player ${currentPlayer} scored ${ballScore} points.`);
        playerScored = true; // Set to true since the player scored
    }
}

// Display the scoreboard at the top of the screen
function displayScoreboard() {
    if (mode === "multiplayer") {
        fill(255);
        textSize(24);
        textAlign(CENTER);
        text(`Player 1: ${score1} | Player 2: ${score2}`, width / 2, 30);
        text(`Current Turn: Player ${currentPlayer}`, width / 2, 60);
    }
}

// Function to switch turns in multiplayer mode
function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    console.log(`Switched to Player ${currentPlayer}`);
}

function hasBallsMoved() {
    for (let ball of balls) {
        if (!ball.body.isSleeping) return true; // A ball is moving
    }
    if (!cueBall.body.isSleeping) return true; // Cue ball is moving
    return false; // No balls have moved
}

function isShotComplete() {
    const velocityThreshold = 0.05; // Minimum velocity to consider a ball "stopped"

    // Check all balls
    for (let ball of balls) {
        const velocity = ball.body.velocity;
        if (Math.sqrt(velocity.x ** 2 + velocity.y ** 2) > velocityThreshold) {
            return false; // A ball is still moving
        }
    }

    // Check the cue ball
    const cueVelocity = cueBall.body.velocity;
    if (Math.sqrt(cueVelocity.x ** 2 + cueVelocity.y ** 2) > velocityThreshold) {
        return false; // Cue ball is still moving
    }

    return true; // All balls are effectively stationary
}

// Helper to reset shot-related variables
function resetShotTracking() {
    shotInitiated = false;
    cueBallMoved = false;
    turnFinalized = false;
}

// Function to finalize the player's turn after their shot
function finalizeTurn() {
    console.log(`Finalizing Player ${currentPlayer}'s turn.`);

    if (playerScored) {
        console.log(`Player ${currentPlayer} scored! Turn remains.`);
        playerScored = false; // Reset the scoring flag
        return; // Keep the turn with the current player
    }

    if (cueBallPocketed) {
        console.log(`Cue ball pocketed! Foul by Player ${currentPlayer}.`);
        cueBallPocketed = false; // Reset the cue ball pocketed flag
        resetCueBall(); // Allow the next player to reposition the cue ball
    }

    // Switch to the other player if no score or foul
    switchTurn();
    console.log(`Switched to Player ${currentPlayer}`);
}




//-------------------------- Ball Initialization Functions -----------
// Ball Initialization
function initializeBalls() {
    balls = [];
    createRedBalls();
    createColoredBalls();
}

function createRedBalls() {
    let startX = width / 2 + tableWidth / 4; // Starting position (front of the triangle)
    let startY = height / 2; // Center vertically
    let rows = 5; // Number of rows in the triangle
    let horizontalSpacing = ballDiameter * 0.866; // Horizontal distance between balls in a row
    let verticalSpacing = ballDiameter; // Vertical distance between rows
    
    console.log(`Placing red balls with horizontalSpacing: ${horizontalSpacing}, verticalSpacing: ${verticalSpacing}`);

    for (let row = 0; row < rows; row++) {
        let rowStartX = startX + row * horizontalSpacing; // Offset for each row
        let rowStartY = startY - (row * verticalSpacing) / 2; // Center the row vertically

        for (let i = 0; i <= row; i++) {
            let x = rowStartX;
            let y = rowStartY + i * verticalSpacing;

            // No retries needed as the position is deterministic
            balls.push(new Ball(x, y, ballDiameter, "red", false)); // Add ball as dynamic
            console.log(`Row ${row}, Ball ${i}: Placed at (${x}, ${y})`);
        }
    }
}

function createColoredBalls() {
    let coloredPositions = [
        { x: width / 2 - tableWidth / 4, y: height / 2 - ballDiameter * 2, color: "yellow" },
        { x: width / 2 - tableWidth / 4, y: height / 2, color: "brown" },
        { x: width / 2 - tableWidth / 4, y: height / 2 + ballDiameter * 2, color: "green" },
        { x: width / 2, y: height / 2, color: "blue" },
        { x: (width / 2 + tableWidth / 4) * 0.96, y: height / 2, color: "pink" },
        { x: (width / 2 + tableWidth / 3) * 1.02, y: height / 2, color: "black" }
    ];

    console.log("Placing colored balls...");

    for (let pos of coloredPositions) {
        let placed = false;
        for (let attempt = 0; attempt < 5; attempt++) {
            if (isValidPosition(pos.x, pos.y, balls, ballDiameter * 1.1)) {
                balls.push(new Ball(pos.x, pos.y, ballDiameter, pos.color, true)); // Add ball as static
                console.log(`Placed ${pos.color} ball at (${pos.x}, ${pos.y})`);
                placed = true;
                break;
            } else {
                // Slightly adjust position and retry
                pos.x += random(-ballDiameter / 2, ballDiameter / 2);
                pos.y += random(-ballDiameter / 2, ballDiameter / 2);
                console.log(`Retrying placement for ${pos.color} ball...`);
            }
        }
        if (!placed) {
            console.error(`Failed to place ${pos.color} ball.`);
        }
    }
}

// Finalize Ball Setup
function finalizeBallSetup() {
    for (let ball of balls) ball.setDynamic();
    if (cueBall) Matter.Body.setStatic(cueBall.body, false);
    console.log("Balls set up and dynamic.");
}

// Check if Ball Placement is Valid
function isValidPosition(x, y, balls, safeDistance) {
    for (let ball of balls) {
        let pos = ball.body.position;
        if (dist(x, y, pos.x, pos.y) < safeDistance) {
            console.error(`Invalid position: Overlaps with ball at (${pos.x}, ${pos.y})`);
            return false;
        }
    }
    return true;
}


// Ball Class
class Ball {
    constructor(x, y, diameter, color, isStatic = false) {
        this.body = Matter.Bodies.circle(x, y, diameter / 2, {
            restitution: 0.7,
            friction: 0.02,
            frictionAir: 0.02,
            isStatic: isStatic,
            
        });
        this.color = color;
        this.diameter = diameter;
        Matter.World.add(world, this.body);
    }
    
    setDynamic() {
        Matter.Body.setStatic(this.body, false); // Make dynamic for gameplay
    }

    show() {
        let pos = this.body.position;
        fill(50, 50, 50, 150);
        ellipse(pos.x, pos.y + this.diameter * 0.3, this.diameter * 1.1, this.diameter * 0.5);
        fill(this.color);
        noStroke();
        ellipse(pos.x, pos.y, this.diameter);
        fill(255, 255, 255, 150);
        ellipse(pos.x - this.diameter * 0.2, pos.y - this.diameter * 0.2, this.diameter * 0.3);
    }
}
