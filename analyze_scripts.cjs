const fs = require('fs');
const glob = require('fs').readdirSync;

const files = glob('.').filter(f => f.startsWith('script_') && f.endsWith('.txt'));
console.log('Script files:', files);

// Let's inspect the files for something like '["1...', or drive file IDs.
// A drive file ID typically starts with 1 and is 33 chars long: [a-zA-Z0-9_-]{33}
const driveIdRegex = /\b[1][a-zA-Z0-9_-]{32}\b/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const dIds = content.match(driveIdRegex) || [];
  const uniqueDIds = Array.from(new Set(dIds));
  console.log(`File ${file} has IDs:`, uniqueDIds);
  
  // also find any names or MP3 things or download links
  // Let's find any .mp3 or similar or titles
  // We can look for vietnamese chars or "dau chan" or "thuc dia"
  const lines = content.split('\n');
  for (let ln of lines) {
    if (ln.toLowerCase().includes('dau chan') || ln.toLowerCase().includes('thuc dia') || ln.toLowerCase().includes('mp3') || ln.toLowerCase().includes('wav') || ln.toLowerCase().includes('nhac') || ln.toLowerCase().includes('audio')) {
      console.log(`  [Match in ${file}]:`, ln.trim().slice(0, 150));
    }
  }
}
