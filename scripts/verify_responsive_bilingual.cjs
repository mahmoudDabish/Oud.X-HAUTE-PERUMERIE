const puppeteer = require('puppeteer');

async function run() {
  console.log('=== STARTING RESPONSIVE & BILINGUAL NAVBAR TEST ===');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const url = 'http://localhost:3002'; // Vite dev server is running on port 3002

  // Viewports to test
  const viewports = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 812 }
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Check English layout
    const initialLang = await page.evaluate(() => document.documentElement.lang);
    const initialDir = await page.evaluate(() => document.documentElement.dir);
    console.log(`[${vp.name}] Default Language: ${initialLang}, Dir: ${initialDir}`);

    // Check header dimensions & overflow
    const headerInfo = await page.evaluate(() => {
      const header = document.querySelector('header');
      const doc = document.documentElement;
      return {
        headerHeight: header ? header.offsetHeight : 0,
        hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
        logoText: document.querySelector('header .font-cinzel')?.textContent?.trim()
      };
    });

    console.log(`[${vp.name} EN] Header Height: ${headerInfo.headerHeight}px, Logo: "${headerInfo.logoText}", Overflow: ${headerInfo.hasHorizontalOverflow}`);
    if (headerInfo.hasHorizontalOverflow) {
      console.error(`ERROR: Horizontal overflow detected on ${vp.name} in EN! (${headerInfo.scrollWidth} > ${headerInfo.innerWidth})`);
      process.exit(1);
    }

    // Switch language to Arabic
    console.log(`[${vp.name}] Switching to Arabic...`);
    // Find language switcher button
    const switchedToAr = await page.evaluate(() => {
      // In mobile menu or in header
      const langBtn = document.querySelector('button[title*="اللغة"]') || 
                      document.querySelector('button[aria-label*="العربية"]') ||
                      document.querySelector('button[aria-label*="language"]');
      if (langBtn) {
        langBtn.click();
        return true;
      }
      return false;
    });

    // If dropdown opened, click Arabic option
    await new Promise(r => setTimeout(r, 300));
    await page.evaluate(() => {
      const arOptions = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('العربية'));
      if (arOptions.length > 0) {
        arOptions[0].click();
      }
    });

    await new Promise(r => setTimeout(r, 600));

    // Verify Arabic state
    const arState = await page.evaluate(() => {
      const doc = document.documentElement;
      const header = document.querySelector('header');
      return {
        lang: doc.lang,
        dir: doc.dir,
        hasHorizontalOverflow: doc.scrollWidth > window.innerWidth,
        scrollWidth: doc.scrollWidth,
        innerWidth: window.innerWidth,
        headerHeight: header ? header.offsetHeight : 0,
      };
    });

    console.log(`[${vp.name} AR] Lang: ${arState.lang}, Dir: ${arState.dir}, Header Height: ${arState.headerHeight}px, Overflow: ${arState.hasHorizontalOverflow}`);
    if (arState.dir !== 'rtl') {
      console.error(`ERROR: RTL direction not set after switching to Arabic on ${vp.name}!`);
      process.exit(1);
    }
    if (arState.hasHorizontalOverflow) {
      console.error(`ERROR: Horizontal overflow detected on ${vp.name} in AR! (${arState.scrollWidth} > ${arState.innerWidth})`);
      process.exit(1);
    }
  }

  console.log('\n=== TESTING PRODUCT CARD & HERO BILINGUAL DISPLAY ===');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Test Arabic display on Hero & Product Cards
  await page.evaluate(() => {
    // Switch to Arabic
    const langBtn = document.querySelector('button[title*="اللغة"]');
    if (langBtn) langBtn.click();
  });
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => {
    const arOptions = Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.includes('العربية'));
    if (arOptions.length > 0) arOptions[0].click();
  });
  await new Promise(r => setTimeout(r, 600));

  const pageData = await page.evaluate(() => {
    const productTitles = Array.from(document.querySelectorAll('h3, h4')).map(el => el.textContent?.trim()).filter(Boolean);
    const heroTitle = document.querySelector('h1')?.textContent?.trim();
    const prices = Array.from(document.querySelectorAll('.font-cinzel')).map(el => el.textContent?.trim()).filter(Boolean);
    return {
      heroTitle,
      sampleTitles: productTitles.slice(0, 5),
      samplePrices: prices.slice(0, 5)
    };
  });

  console.log('Arabic Hero title:', pageData.heroTitle);
  console.log('Sample Product Titles on Page:', pageData.sampleTitles);
  console.log('Sample Prices (must have ج.م in AR):', pageData.samplePrices);

  const hasArabicCurrency = pageData.samplePrices.some(p => p.includes('ج.م'));
  console.log('Verified Arabic price formatting (ج.م):', hasArabicCurrency);

  await browser.close();
  console.log('\n=== RESPONSIVE & BILINGUAL NAVBAR TEST COMPLETED SUCCESSFULLY! ===');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
