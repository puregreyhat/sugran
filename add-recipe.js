#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(process.cwd(), 'db', 'recipes.json');
function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
}
function writeDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(q) {
  return new Promise(resolve => rl.question(q, ans => resolve(ans)));
}

(async function main(){
  console.log('Interactive Recipe Adder for Sugran');
  const name = (await question('Recipe name: ')).trim();
  if (!name) { console.log('Name required'); process.exit(1); }
  const cuisine = (await question('Cuisine (e.g. Maharashtrian): ')).trim() || 'unknown';
  const servings = parseInt((await question('Servings (number): ')).trim() || '1', 10);
  const calories = parseInt((await question('Calories (per serving, optional): ')).trim() || '0', 10) || null;
  const image_url = (await question('Image URL (optional): ')).trim() || null;

  // Ingredients: ask in loop
  console.log('Enter ingredients one per line in format: name|quantity|unit (blank line to finish)');
  const ingredients = [];
  while (true) {
    const line = (await question('- ')).trim();
    if (!line) break;
    const parts = line.split('|').map(s=>s.trim());
    ingredients.push({ name: parts[0] || '', quantity: parts[1] ? Number(parts[1]) : null, unit: parts[2] || null });
  }

  console.log('Enter steps one per line (blank line to finish)');
  const steps = [];
  while (true) {
    const s = (await question('- ')).trim();
    if (!s) break;
    steps.push(s);
  }

  const newRecipe = {
    id: uuidv4(),
    name,
    cuisine,
    ingredients,
    steps,
    image_url,
    calories,
    servings,
    created_at: new Date().toISOString(),
  };

  const db = readDb();
  db.unshift(newRecipe);
  writeDb(db);
  console.log('Recipe added:', newRecipe.id);
  rl.close();
})();
