const fs = require('fs');
const https = require('https');

const url = 'https://drive.google.com/drive/folders/1JBrAStVzrsNbciKsSpx1qmgtKEhuHJtf?usp=sharing';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('drive_folder.html', data);
    console.log('Saved drive_folder.html, size:', data.length);
    
    // Look for potential Google Drive ID patterns and names
    // Typically Google Drive IDs are 33 characters (alphanumeric, underscores, hyphens)
    // and are found in various JSON structures on the page, like [ "0B...", "Name", ... ] or /file/d/ID/view etc.
    const fileMatches = [...data.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{28,})/g)].map(m => m[1]);
    const uniqueIds = Array.from(new Set(fileMatches));
    console.log('Found file IDs:', uniqueIds);
    
    // Check for another common pattern: [ "ID", "Name", ... ] in the JSON data
    // Let's search for patterns like ["<33-char ID>", or similar.
    // Usually drive stores folder contents in a script block like `_initialDataState` or similar.
    fs.writeFileSync('drive_links.txt', JSON.stringify(uniqueIds, null, 2));
  });
}).on('error', (err) => {
  console.error('Error fetching drive folder:', err);
});
