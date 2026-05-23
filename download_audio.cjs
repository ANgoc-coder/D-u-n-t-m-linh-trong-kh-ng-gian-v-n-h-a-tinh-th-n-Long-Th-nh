const fs = require('fs');
const https = require('https');
const path = require('path');

const fileId = '1o3ZtGzq-9TAjA3aO-TaGE0ZkE2POGcSR';
// Google Drive URL
const url = `https://docs.google.com/uc?export=download&id=${fileId}`;

function downloadFile(targetUrl, outputPath) {
  console.log('Downloading from:', targetUrl);
  https.get(targetUrl, (res) => {
    // Handle redirects
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      downloadFile(res.headers.location, outputPath);
      return;
    }

    if (res.statusCode !== 200) {
      console.error(`Request failed with status code ${res.statusCode}`);
      return;
    }

    const fileStream = fs.createWriteStream(outputPath);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      const stats = fs.statSync(outputPath);
      console.log(`Finished downloading file to ${outputPath}. Size: ${stats.size} bytes`);
    });
  }).on('error', (err) => {
    console.error('Error downloading:', err);
  });
}

// Make sure directory exists
const targetDir = path.join(__dirname, 'src', 'assets', 'audio');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const outputPath = path.join(targetDir, 'dau_chan_thuc_dia.mp3');
downloadFile(url, outputPath);
