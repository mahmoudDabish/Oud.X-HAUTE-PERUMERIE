const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function optimizeFavicon() {
  console.log('Optimizing logo.png favicon...');
  const originalPath = path.resolve(__dirname, '../public/logo.png');
  const backupPath = path.resolve(__dirname, '../public/logo_original.png');

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(originalPath, backupPath);
  }

  // Quick local server to serve the image without file:// security restrictions
  const server = http.createServer((req, res) => {
    if (req.url === '/logo.png') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      fs.createReadStream(backupPath).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;

  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();

  await page.goto(`http://127.0.0.1:${port}/logo.png`);

  const resizedBase64 = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    c.width = 192;
    c.height = 192;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, 192, 192);
    return c.toDataURL('image/png').split(',')[1];
  });

  fs.writeFileSync(originalPath, Buffer.from(resizedBase64, 'base64'));
  const oldSize = fs.statSync(backupPath).size;
  const newSize = fs.statSync(originalPath).size;
  console.log(`Favicon successfully optimized: ${(oldSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB (-${Math.round((1 - newSize/oldSize) * 100)}%)`);

  await browser.close();
  server.close();
}

optimizeFavicon().catch(err => {
  console.error('Failed to optimize favicon:', err);
  process.exit(1);
});
