import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'recipes.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || null;
const GITHUB_REPO = process.env.GITHUB_REPO || 'puregreyhat/sugran'; // owner/repo
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

async function readFromGithub() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/db/recipes.json?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('github read failed: ' + res.status);
  const j = await res.json();
  if (!j.content) return [];
  const content = Buffer.from(j.content, 'base64').toString('utf-8');
  return JSON.parse(content || '[]');
}

async function writeToGithub(data) {
  // Need to fetch current sha
  const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/db/recipes.json?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } });
  let sha = null;
  if (getRes.ok) {
    const gj = await getRes.json();
    sha = gj.sha;
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/db/recipes.json`;
  const body = {
    message: `Update recipes.json via API at ${new Date().toISOString()}`,
    content: Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64'),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('github write failed: ' + res.status + ' ' + txt);
  }
  return true;
}

export async function readDb() {
  if (GITHUB_TOKEN) {
    try {
      return await readFromGithub();
    } catch (e) {
      console.error('readDb github fallback error', e);
      // fall back to local
    }
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export async function writeDb(data) {
  if (GITHUB_TOKEN) {
    try {
      return await writeToGithub(data);
    } catch (e) {
      console.error('writeDb github error', e);
      // fall through to local write attempt
    }
  }
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('writeDb fs error', e);
    return false;
  }
}

export default { readDb, writeDb };
