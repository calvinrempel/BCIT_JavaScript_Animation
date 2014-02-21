/*
 * Draw an animated house scene on a canvas with a given ID.
 *
 * Author: Calvin Rempel
 * Author: Casey Hammond
 * Date: Nov. 29, 2013
 */

var canvas, ctx;
var X_OFFSET, Y_OFFSET, FPS;
var time, interval, timeIncreasing, timeSpeed;

var smokeX, smokeY;
var smokeRadius = 12;
var smokeVelX, smokeVelY, smokeRandomness;
var smokeAge;

/**
 * Initialize the canvas and draw the scene.
 *
 * @param canvasId the Id of the Canvas
 */
function init(canvasId) {
    canvas = document.getElementById(canvasId);
    canvas.width = 300;
    canvas.height = 300;
    ctx = canvas.getContext("2d");
    X_OFFSET = 10;
    Y_OFFSET = 100;

    smokeVelX = 0.8;
    smokeVelY = -0.8;
    smokeRadius = 5;
    smokeRandomness = 0.4;
    smokeX = [];
    smokeY = [];
    smokeAge = [];
    addSmoke();

    FPS = 100;
    timeSpeed = 0.01;
    time = 0;
    timeIncreasing = true;
    interval = setInterval(animateScene, FPS);
    drawScene(time);
}

/**
 * Animate the Scene
 */
function animateScene() {
    animateSmoke();
    drawScene(time);

    // Update the Time Of Day and make it oscillate
    if (timeIncreasing) {
        if (time + timeSpeed > 1) {
            time = 1 - (time + timeSpeed - 1);
            timeIncreasing = false;
        } else {
            time += timeSpeed;
        }
    } else {
        if (time - timeSpeed < 0) {
            time = (time - timeSpeed) * -1;
            timeIncreasing = true;
        } else {
            time -= timeSpeed;
        }
    }
}

/**
 * Animate the Smoke.
 */
function animateSmoke() {
    var j, i, randFactor;

    for (j = 0; j < smokeX.length; j += 1) {
        randFactor = (Math.random() % (smokeRandomness * 2)) - smokeRandomness;
        for (i = 0; i < smokeX[j].length; i += 1) {
            smokeX[j][i] += smokeVelX + randFactor;
        }
        smokeY[j][1] += smokeVelY + randFactor;
        smokeY[j][0] += smokeVelY + randFactor;
        smokeAge[j] += 1;
    }

    // If the Smoke is past a certain threshold, add another.
    if (smokeX[smokeX.length - 1][0] > 150) {
        addSmoke();
    }

    // If the puff of smoke is offscreen, remove it.
    if (smokeX[0][0] > canvas.width) {
        removeSmoke();
    }
}

/**
 * Draw the Scene.
 * 
 * @param timeOfDay the time of day as a float between 0-1 where 0 is noon, and
 *        1 is midnight
 */
function drawScene(timeOfDay) {
    var night, light;
    night = timeOfDay > 0.3;
    light = night && timeOfDay < 0.8;

    drawBackground();
    drawWalls();
    drawWindows(night, light);
    drawDoor();
    drawRoof();
    drawRoofTrim();
    drawSmoke();
    drawChimney();
    drawFoliage();
    drawOverlay(timeOfDay);
}

/**
 * Draw the Background.
 */
function drawBackground() {
    var colour = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    colour.addColorStop(0, "#3861A1");
    colour.addColorStop(1, "#BBD6EC");
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#616540";
    ctx.fillRect(0, 220, canvas.width, canvas.height);
}

/**
 * Draw the House Walls.
 */
function drawWalls() {
    var lightColour, darkColour, polygons;
    lightColour = "#CECABE";
    darkColour = "#757170";
    shadowColour = "#564F47";

    // Draw Light Walls
    polygons = [
        [ [235, 101], [176, 97], [176, 110], [235, 113] ],
        [ [189, 123], [210, 124], [210, 142], [189, 142] ],
        [ [189, 120], [189, 144], [141, 144], [141, 119] ],
        [ [247, 145], [247, 121], [233, 106], [218, 120], [218, 145] ]
    ];
    fillPolygons(polygons, lightColour, X_OFFSET, Y_OFFSET);

    // Draw Dark Walls
    polygons = [
        [ [218, 124], [210, 124], [210, 142], [218, 144] ],
        [ [141, 119], [113, 74], [104, 94], [103, 139], [141, 144] ],
        [ [35, 143], [35, 117], [25, 86], [16, 118], [17, 141] ],
        [ [151, 94], [151, 108], [141, 94] ]
    ];
    fillPolygons(polygons, darkColour, X_OFFSET, Y_OFFSET);

    // Draw More Light Walls
    polygons = [
        [ [35, 117], [116, 119], [116, 142], [35, 143] ],
        [ [151, 108], [173, 109], [173, 95], [162, 85], [151, 94] ]
    ];
    fillPolygons(polygons, lightColour, X_OFFSET, Y_OFFSET);

    // Draw Shadows
    polygons = [
        [ [35, 118], [119, 121], [118, 118], [35, 116] ],
        [ [140, 120], [189, 121], [189, 118], [140, 118] ],
        [ [176, 99], [235, 102], [235, 99], [176, 97] ],
        [ [232, 107], [246, 121], [250, 121], [234, 105] ]
    ];
    fillPolygons(polygons, shadowColour, X_OFFSET, Y_OFFSET);
}

/**
 * Draw the Front Door.
 */
function drawDoor() {
    var doorColour, polygon;
    doorColour = "#72634E";
    polygon = [ [210, 123], [210, 142], [203, 142], [203, 123] ];
    fillPolygon(polygon, doorColour, X_OFFSET, Y_OFFSET);
}

/**
 * Draw the House Windows.
 *
 * @param night indicate if it is night time or not
 * @param lights indicate if the lights should be turned on (at night only)
 */
function drawWindows(night, lights) {
    var windows, shutterColor, shutterWidth;
    shutterColor = "#4A4944";
    shutterWidth = 5;

    windows = [
        [ [223, 126], [242, 126], [242, 140], [223, 140] ],
        [ [154, 96], [169, 96], [169, 107], [154, 107] ],
        [ [187, 99], [206, 99], [206, 110], [187, 110] ],
        [ [149, 123], [164, 123], [164, 140], [149, 140] ],
        [ [168, 123], [181, 123], [181, 140], [168, 140] ],
        [ [190, 122], [202, 122], [202, 135], [190, 135] ],
        [ [57, 122], [71, 122], [71, 138], [57, 138] ],
        [ [86, 122], [100, 122], [100, 138], [86, 138] ]
    ];
    drawWindowShapes(windows, shutterColor, 4, night, lights);
}

/**
 * Draw the House Roof.
 */
function drawRoof() {
    var polygons, roofColour, darkRoofColour;
    roofColour = "#655B51";
    darkRoofColour = "#221E1D";
    midColour = "#564F47";

    // Draw Light Roof
    polygons = [
        [ [153, 70], [217, 74], [241, 98], [175, 95] ],
        [ [223, 104], [234, 104], [217, 120], [189, 120], [189, 111],
            [216, 111] ],
        [ [110, 71], [153, 74], [163, 83], [150, 94], [142, 95], [151, 108],
            [173, 108], [173, 98], [176, 98], [176, 101], [182, 101],
            [195, 118], [139, 118] ],
        [ [23, 80], [104, 85], [102, 90], [113, 106], [114, 117], [32, 115] ]
    ];
    fillPolygons(polygons, roofColour, X_OFFSET, Y_OFFSET);

    // Draw Dark Roof
    polygons = [
        [ [152, 73], [153, 70], [176, 96], [176, 100], [173, 100], [173, 95],
            [162, 84] ],
        [ [110, 71], [113, 75], [105, 94], [100, 94] ],
        [ [23, 79], [25, 86], [17, 117], [13, 117] ],
        [ [138, 95], [151, 108], [142, 95] ]
    ];
    fillPolygons(polygons, darkRoofColour, X_OFFSET, Y_OFFSET);

    // Draw mid-shaded roof
    polygons = [
        [ [163, 81], [150, 82], [138, 95], [149, 94] ],
        [ [162, 83], [175, 96], [173, 96], [161, 84] ],
        [ [233, 104], [223, 104], [216, 111], [217, 120] ]
    ];
    fillPolygons(polygons, midColour, X_OFFSET, Y_OFFSET);
}

/**
 * Draw the Roofing Trim.
 */
function drawRoofTrim() {
    var polygons, colour;
    colour = "#DDD";

    polygons = [
        [ [33, 115], [116, 116], [116, 120], [33, 117] ],
        [ [175, 95], [241, 98], [241, 101], [175, 98] ],
        [ [163, 81], [177, 94], [177, 96], [175, 96], [163, 84], [150, 95],
            [149, 93] ],
        [ [189, 121], [218, 121], [218, 124], [189, 124] ],
        [ [139, 116], [194, 117], [194, 119], [139, 118] ],
        [ [234, 104], [251, 120], [251, 122], [234, 106], [219, 121],
            [217, 119] ]
    ];
    fillPolygons(polygons, colour, X_OFFSET, Y_OFFSET);
}

/**
 * Draw the House Chimney.
 */
function drawChimney() {
    var polygons, lightColour, darkColour, shadowColour;

    lightColour = "#9C714E";
    darkColour = "#684A37";
    shadowColour = "#5E4433";

    // Draw light areas of the chimney
    polygons = [
        [ [119, 59], [118, 120], [119, 122], [119, 142], [124, 142], [124, 122],
            [123, 120], [123, 93], [120, 88], [120, 83], [124, 83], [124, 61] ]
    ];
    fillPolygons(polygons, lightColour, X_OFFSET, Y_OFFSET);

    // Draw dark areas of the chimney
    polygons = [
        [ [119, 142], [119, 122], [118, 120], [119, 59], [114, 61], [114, 120],
            [113, 122], [113, 142] ]
    ];
    fillPolygons(polygons, darkColour, X_OFFSET, Y_OFFSET);

    // Draw Shadows on the Chimney
    polygons = [
        [ [124, 142], [124, 122], [123, 120], [123, 93], [120, 88], [120, 120],
            [121, 122], [121, 142] ]
    ];
    fillPolygons(polygons, shadowColour, X_OFFSET, Y_OFFSET);
}

function drawFoliage() {
    var polygons, red, green, darkGreen;

    red = "#624233";
    green = "#5C5636";
    darkGreen = "#342812";

    // Draw Light Green plants
    polygons = [
        [ [37, 143], [41, 138], [43, 143], [47, 139], [50, 140], [53, 140],
            [54, 143] ],
        [ [78, 143], [76, 140], [81, 141], [82, 143] ]
    ];
    fillPolygons(polygons, green, X_OFFSET, Y_OFFSET);

    // Draw Dark Green Plants
    polygons = [
        [ [61, 143], [62, 140], [66, 140], [68, 143] ],
        [ [86, 143], [89, 138], [93, 139], [96, 139], [101, 143] ],
        [ [34, 143], [33, 139], [31, 143] ],
        [ [158, 145], [162, 142], [163, 143], [165, 141], [169, 142],
            [173, 141], [176, 144] ],
        [ [223, 145], [225, 142], [228, 141], [232, 143], [234, 144],
            [238, 142], [245, 145], [240, 145], [228, 145] ]
    ];
    fillPolygons(polygons, darkGreen, X_OFFSET, Y_OFFSET);

    // Draw Reddish plants
    polygons = [
        [ [103, 143], [99, 141], [96, 137], [101, 137], [102, 135], [106, 136],
            [108, 137], [110, 138], [112, 137], [115, 136], [116, 139],
            [119, 137], [124, 140], [121, 141], [119, 144], [113, 144],
            [110, 143], [106, 144] ]
    ];
    fillPolygons(polygons, red, X_OFFSET, Y_OFFSET);
}

/**
 * Draw an overlay to simulate lighting
 *
 * @param timeOfDay the time of day as a float between 0-1 where 0 is noon, and
 *        1 is midnight
 */
function drawOverlay(timeOfDay) {
    var colour, opacity;

    opacity = timeOfDay / 1.5;
    colour = "#000";

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

/**
 * Draw the Smoke
 */
function drawSmoke() {
    var grd, i, j, top, radius;

    grd = ctx.createLinearGradient(0, 0, 290, 0);
    grd.addColorStop(0, "grey");
    grd.addColorStop(1, "white");

    for (j = 0; j < smokeX.length; j += 1) {
        top = false;
        radius = smokeAge[j] / smokeRadius;

        for (i = 0; i < smokeX[j].length; i += 1) {
            if (smokeAge[j] > i * 1.5) {
                if (top) {
                    drawCircle(smokeX[j][i], smokeY[j][1] - i * 2, radius, grd);
                    top = false;
                } else {
                    drawCircle(smokeX[j][i], smokeY[j][0] - i * 2, radius, grd);
                    top = true;
                }
            }
        }
    }
}

/**
 * Add a puff of smoke.
 */
function addSmoke() {
    xNew = [123, 126, 128];
    yNew = [153, 147];

    if (Math.random() > 0.5) {
        xNew.push(131);
        xNew.push(133);
    }

    smokeX.push(xNew);
    smokeY.push(yNew);
    smokeAge.push(0);
}

/**
 * Remove the oldest puff of smoke.
 */
function removeSmoke() {
    smokeX.splice(0, 1);
    smokeY.splice(0, 1);
    smokeAge.splice(0, 1);
}

/**
 * Fill a polygon defined by a 2D array of Points.
 *
 * @param points a 2D array of polygon vertices.
 * @param colour a css accepted colour to fill the polygon with.
 * @param xOffset the amount to offset X by
 * @param yOffset the amount to offset Y by
 */
function fillPolygon(points, colour, xOffset, yOffset) {
    var i;
    ctx.beginPath();
    ctx.fillStyle = colour;
    ctx.moveTo(points[0][0] + xOffset, points[0][1] + yOffset);

    for (i = 1; i < points.length; i += 1) {
        ctx.lineTo(points[i][0] + xOffset, points[i][1] + yOffset);
    }

    ctx.closePath();
    ctx.fill();
}

/**
 * Fill several polygons with the same colour.
 *
 * @param polygons an array of 2D arrays, each containing the points of the
 *        vertices defining a polygonal shape.
 * @param colour the colour with which to draw the polygons
 * @param xOffset the amount to offset X by
 * @param yOffset the amount to offset Y by
 */
function fillPolygons(polygons, colour, xOffset, yOffset) {
    var i;
    for (i = 0; i < polygons.length; i += 1) {
        fillPolygon(polygons[i], colour, xOffset, yOffset);
    }
}

/**
 * Draw a Circle
 *
 * @param x the x coordinate of the circle
 * @param y the y coordinate of the circle
 * @param gradient the fill colour of the circle
 */
function drawCircle(x, y, radius, gradient) {
    var startAngle, endAngle;

    startAngle = 0;
    endAngle = 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.fillStyle = gradient;
    ctx.fill();
}

/**
 * Draw a Window Shape with shutters.
 *
 * @param points the Points on the window (2d array starting at top left corner
 *        and working clock-wise).
 * @param shutterColour the colour of the shutters.
 * @param shutterWidth the width of the shutters.
 * @param night indicates if it is Night time
 * @param lights indicates if lights should be on or off
 */
function drawWindowShape(points, shutterColour, shutterWidth, night, lights) {
    var shutters, ratio, xDiff, yDiff, hyp, xOff, yOff, newX, newY,
        newX2, newY2, windowHeight, glassColour;

    glassColour = ctx.createLinearGradient(points[0][0] + X_OFFSET,
        points[0][1] + Y_OFFSET, points[2][0] + X_OFFSET,
        points[2][1] + Y_OFFSET);

    if (night) {
        if (lights) {
            glassColour.addColorStop(0, "white");
            glassColour.addColorStop(1, "yellow");
        } else {
            glassColour.addColorStop(0, "grey");
            glassColour.addColorStop(1, "black");
        }
    } else {
        glassColour.addColorStop(0, "grey");
        glassColour.addColorStop(0.5, "white");
        glassColour.addColorStop(1, "grey");
    }

    // Draw Glass
    fillPolygon(points, glassColour, X_OFFSET, Y_OFFSET);

    // Calculate Window Skew
    xDiff = points[1][0] - points[0][0];
    yDiff = points[1][1] - points[0][1];
    hyp = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
    ratio = hyp / shutterWidth;
    xOff = xDiff / ratio;
    yOff = yDiff / ratio;
    newX = points[0][0] + xOff;
    newY = points[0][1] - yOff;
    newX2 = points[1][0] - xOff;
    newY2 = points[1][1] + yOff;
    windowHeight = points[3][1] - points[0][1];

    // Calculate Shutter Points
    shutters = [
        [ [points[0][0], points[0][1]], [newX, newY],
            [newX, newY + windowHeight], [points[3][0], points[3][1]] ],
        [ [newX2, newY2], [points[1][0], points[1][1]],
            [points[2][0], points[2][1]], [newX2, newY2 + windowHeight]]
    ];
    fillPolygons(shutters, shutterColour, X_OFFSET, Y_OFFSET);
}

/**
 * Draw a collection of Window Shapes with shutters.
 *
 * @param windows a collection (3D array) of the Points on the windows (2d array
 *        starting at top left corner and working clock-wise).
 * @param shutterColour the colour of the shutters.
 * @param shutterWidth the width of the shutters.
 * @param night indicates if it is Night time
 * @param lights indicates if lights should be on or off
 */
function drawWindowShapes(windows, shutterColour, shutterWidth, night, lights) {
    var i;

    for (i = 0; i < windows.length; i += 1) {
        drawWindowShape(windows[i], shutterColour, shutterWidth, night, lights);
    }
}