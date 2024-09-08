const fs = require('fs');
const path = require('path');

// Define the total number of levels and experience points for the first and last levels
const TOTAL_LEVELS = 100;
const FIRST_LEVEL_EXP = 100;
const LAST_LEVEL_EXP = 2000000;

// Exponential function to calculate experience points
function calculateExp(level) {
    const exp = FIRST_LEVEL_EXP + (LAST_LEVEL_EXP - FIRST_LEVEL_EXP) * Math.pow((level - 1) / (TOTAL_LEVELS - 1), 2);
    return Math.round(exp);
}

// Generate experience points for each level
const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    const experience = calculateExp(level);
    return { level, experience };
});

// Write to JSON file
const filePath = path.join(__dirname, 'levels.json');
fs.writeFileSync(filePath, JSON.stringify(levels, null, 4), 'utf8');

console.log("Updated levels.json with new experience points.");