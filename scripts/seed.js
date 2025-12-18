const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, '..', 'db', 'recipes.json');
const src = path.join(__dirname, '..', 'db', 'recipes.json');

if (!fs.existsSync(seedPath)) {
  console.error('No seed found at', seedPath);
  process.exit(1);
}

// just print count
const data = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
console.log('Seed contains', data.length, 'recipes');
