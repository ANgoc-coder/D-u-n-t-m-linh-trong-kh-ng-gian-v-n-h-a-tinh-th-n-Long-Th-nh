const fs = require('fs');
const html = fs.readFileSync('drive_folder.html', 'utf8');

// Find all occurrences of IDs (usually 33 characters, like 1JBrA... or similar) or filenames
// Let's look for common audio extensions like ".mp3", ".wav", or names containing Unicode characters
console.log('HTML size:', html.length);

// Let's search if "mp3" is mentioned anywhere
const mp3Matches = html.match(/[\w_-]+\.mp3/gi);
console.log('mp3 file matches:', mp3Matches);

// Let's grep for "1JBrAStVzrsNbciKsSpx1qmgtKEhuHJtf"
const rootFolderIndex = html.indexOf('1JBrAStVzrsNbciKsSpx1qmgtKEhuHJtf');
console.log('Folder ID index:', rootFolderIndex);

// Let's write out text content between script tags to inspect
const scriptBlocks = [];
const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
let match;
while ((match = regex.exec(html)) !== null) {
  scriptBlocks.push(match[1]);
}
console.log('Found script blocks:', scriptBlocks.length);

// Look for a drive bootstrap JSON in script structures, which often contains list of files.
// Let's search inside scripts for strings resembling file lists
for (const [i, sb] of scriptBlocks.entries()) {
  if (sb.includes('1JBrAStVzrsNbciKsSpx1qmgtKEhuHJtf') || sb.includes('Dấu Chân') || sb.includes('audio') || sb.includes('music')) {
    console.log(`Script block ${i} references relevant terms, size:`, sb.length);
    // write to a separate file to analyze
    fs.writeFileSync(`script_${i}.txt`, sb);
  }
}
