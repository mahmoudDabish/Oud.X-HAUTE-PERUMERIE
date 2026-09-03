import puppeteer from 'puppeteer';

export async function convertBase64ToWebp(base64DataUrl, quality = 0.90) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(async (dataUrl, q) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const webpData = canvas.toDataURL('image/webp', q);
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            webpData
          });
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    }, base64DataUrl, quality);

    return result;
  } finally {
    await browser.close();
  }
}
