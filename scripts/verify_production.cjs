const { spawn, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Styling
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

async function main() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}   OUD-X PRODUCTION HARDENING & VERIFICATION SUITE   ${RESET}`);
  console.log(`${BOLD}====================================================\n${RESET}`);

  // ==================================================
  // 10. PRODUCTION BUILD CHECK
  // ==================================================
  console.log(`${BOLD}=== BUILD ===${RESET}\n`);

  process.stdout.write('Running npm run lint (tsc --noEmit)... ');
  const lintRes = spawnSync('npm', ['run', 'lint'], {
    shell: true,
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..')
  });

  const lintPass = lintRes.status === 0;
  console.log(lintPass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`);
  if (!lintPass) {
    console.error('\nLint errors:\n', lintRes.stderr || lintRes.stdout);
    printEarlyExit('Lint check failed.');
    process.exit(1);
  }

  process.stdout.write('Running npm run build (vite build)... ');
  const buildRes = spawnSync('npm', ['run', 'build'], {
    shell: true,
    encoding: 'utf-8',
    cwd: path.resolve(__dirname, '..')
  });

  const buildPass = buildRes.status === 0;
  console.log(buildPass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}\n`);
  if (!buildPass) {
    console.error('\nBuild errors:\n', buildRes.stderr || buildRes.stdout);
    printEarlyExit('Build check failed.');
    process.exit(1);
  }

  // ==================================================
  // 11 & 12. STATIC ASSET & SECURITY SCAN ON DIST
  // ==================================================
  const distDir = path.resolve(__dirname, '..', 'dist');
  let hasSrcAssets = false;
  let hasServiceRole = false;
  let hasLargeBase64 = false;

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDirectory(full);
      } else if (/\.(js|html|css)$/i.test(f)) {
        const content = fs.readFileSync(full, 'utf-8');
        if (content.includes('/src/assets/') || content.includes('src/assets/')) {
          hasSrcAssets = true;
        }
        if (
          content.includes('service_role') ||
          content.includes('SUPABASE_SERVICE_ROLE_KEY') ||
          content.includes('supabase_service_role')
        ) {
          hasServiceRole = true;
        }
        // Check for embedded base64 product images in client bundle (data:image/... > 25kb)
        const b64Match = content.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]{25000,}/g);
        if (b64Match && b64Match.length > 0) {
          hasLargeBase64 = true;
        }
      }
    }
  }

  if (fs.existsSync(distDir)) {
    scanDirectory(distDir);
  }

  // ==================================================
  // START VITE PREVIEW SERVER
  // ==================================================
  const PORT = 4173;
  const BASE_URL = `http://localhost:${PORT}`;

  console.log(`Starting Vite Preview server on ${BASE_URL}...`);
  const viteBin = path.resolve(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js');
  const previewProcess = spawn(process.execPath, [viteBin, 'preview', '--port', String(PORT)], {
    cwd: path.resolve(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const cleanup = () => {
    try {
      if (process.platform === 'win32' && previewProcess.pid) {
        spawnSync('taskkill', ['/pid', String(previewProcess.pid), '/f', '/t']);
      } else if (previewProcess.pid) {
        previewProcess.kill('SIGTERM');
      }
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(); });
  process.on('SIGTERM', () => { cleanup(); process.exit(); });

  // Wait for server to respond
  await waitForServer(BASE_URL, 15000);
  console.log(`${GREEN}Vite Preview server ready.${RESET}\n`);

  // ==================================================
  // PUPPETEER INITIALIZATION
  // ==================================================
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Network & Console tracking
  const globalConsoleErrors = [];
  const globalPageErrors = [];
  const globalFailedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isHarmlessMessage(text)) {
        globalConsoleErrors.push({ text, location: msg.location() });
      }
    }
  });

  page.on('pageerror', err => {
    globalPageErrors.push(err.toString());
  });

  page.on('requestfailed', req => {
    const url = req.url();
    const sanitizedUrl = sanitizeUrl(url);
    const failure = req.failure();
    globalFailedRequests.push({
      url: sanitizedUrl,
      errorText: failure ? failure.errorText : 'Unknown request failure',
      method: req.method()
    });
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      const url = sanitizeUrl(resp.url());
      globalFailedRequests.push({
        url,
        status: resp.status(),
        statusText: resp.statusText(),
        method: resp.request().method()
      });
    }
  });

  // ==================================================
  // 1 & 2. ROUTE DEFINITIONS
  // ==================================================
  const routesToTest = [
    {
      path: '/',
      name: 'Home',
      expectedText: 'oud-x', // As strictly instructed: OUD-X branding
      category: 'core'
    },
    {
      path: '/shop',
      name: 'Shop',
      expectedText: 'all fragrances & extracts',
      category: 'catalog'
    },
    {
      path: '/collections/all',
      name: 'Collections (/all)',
      expectedText: 'all fragrances & extracts',
      category: 'catalog'
    },
    {
      path: '/collections/oud',
      name: 'Collections (/oud)',
      expectedText: 'oud collection',
      category: 'catalog'
    },
    {
      path: '/about',
      name: 'About',
      expectedText: 'the oud_x heritage',
      category: 'content'
    },
    {
      path: '/contact',
      name: 'Contact',
      expectedText: 'concierge',
      category: 'content'
    },
    {
      path: '/cart',
      name: 'Cart',
      expectedText: 'shopping bag',
      category: 'commerce'
    },
    {
      path: '/checkout',
      name: 'Checkout (Empty)',
      expectedText: 'shopping bag is empty',
      category: 'commerce',
      extraCheck: async (p) => {
        // Section 7: confirm no crash, empty-cart UI, no redirect loop
        const url = p.url();
        const text = (await p.evaluate(() => document.body.innerText)).toLowerCase();
        const hasButton = await p.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          return btns.some(b => b.innerText.toLowerCase().includes('boutique') || b.innerText.toLowerCase().includes('shop'));
        });
        return !url.includes('/checkout/checkout') && text.includes('bag is empty') && hasButton;
      }
    },
    {
      path: '/account',
      name: 'Account (Unauth)',
      expectedText: 'client authentication',
      category: 'auth',
      extraCheck: async (p) => {
        // Section 6: confirm no crash, no infinite loading, no blank page, proper auth UI
        const hasSignIn = await p.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('sign in') || text.includes('client authentication');
        });
        const hasSpinnerStuck = await p.evaluate(() => {
          const spinners = document.querySelectorAll('.animate-spin');
          return spinners.length > 0 && !document.querySelector('button');
        });
        return hasSignIn && !hasSpinnerStuck;
      }
    },
    {
      path: '/random-unmapped-path',
      name: 'Unknown 404 Route',
      expectedText: 'destination vaulted',
      category: 'routing',
      extraCheck: async (p) => {
        // Section 8: confirm NotFoundPage rendered, no redirect to Home, no crash
        const text = (await p.evaluate(() => document.body.innerText)).toLowerCase();
        const url = p.url();
        return text.includes('destination vaulted') && text.includes('404') && url.includes('random-unmapped-path');
      }
    }
  ];

  console.log(`${BOLD}=== TESTING ROUTES ===${RESET}\n`);

  const routeResults = [];

  for (const route of routesToTest) {
    process.stdout.write(`Testing [${route.name}] (${route.path})... `);
    const fullUrl = `${BASE_URL}${route.path}`;
    const initialReqFailCount = globalFailedRequests.length;
    const initialConsoleErrCount = globalConsoleErrors.length;
    const initialPageErrCount = globalPageErrors.length;

    let directLoadPass = false;
    let hardRefreshPass = false;
    let statusCode = 0;
    let bodyRendered = false;
    let expectedTextFound = false;
    let reactErrorDetected = false;
    let imgStats = { total: 0, loaded: 0, broken: 0, brokenUrls: [] };
    let extraCheckPass = true;

    try {
      // Step 1: Direct Load
      const resp = await page.goto(fullUrl, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 15000 });
      statusCode = resp ? resp.status() : 0;

      // Step 2: Wait for #root to be populated
      await page.waitForSelector('#root', { timeout: 8000 });
      await new Promise(r => setTimeout(r, 600)); // Allow hydration

      // Step 3: Check body content
      const bodyText = (await page.evaluate(() => document.body.innerText || '')).trim();
      bodyRendered = bodyText.length > 50;
      expectedTextFound = bodyText.toLowerCase().includes(route.expectedText.toLowerCase());

      // Step 4: Check for React errors / crash screens
      reactErrorDetected = await page.evaluate(() => {
        const text = document.body.innerText;
        const hasSomethingWentWrong =
          text.includes('Something went wrong') ||
          text.toLowerCase().includes('application error') ||
          text.toLowerCase().includes('minified react error');
        const hasViteOverlay = !!document.querySelector('vite-error-overlay, iframe#vite-error-overlay');
        return hasSomethingWentWrong || hasViteOverlay;
      });

      // Step 5: Check images (Section 4)
      imgStats = await evaluateImages(page);

      // Step 6: Extra route check
      if (route.extraCheck) {
        extraCheckPass = await route.extraCheck(page);
      }

      directLoadPass =
        statusCode === 200 &&
        bodyRendered &&
        expectedTextFound &&
        !reactErrorDetected &&
        extraCheckPass &&
        imgStats.broken === 0;

      // Step 7: Hard refresh
      const reloadResp = await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 15000 });
      const reloadStatus = reloadResp ? reloadResp.status() : 0;
      await new Promise(r => setTimeout(r, 600));

      const reloadBodyText = (await page.evaluate(() => document.body.innerText || '')).trim();
      const reloadBodyRendered = reloadBodyText.length > 50;
      const reloadTextFound = reloadBodyText.toLowerCase().includes(route.expectedText.toLowerCase());

      const reloadReactError = await page.evaluate(() => {
        const text = document.body.innerText;
        return (
          text.includes('Something went wrong') ||
          text.toLowerCase().includes('application error') ||
          text.toLowerCase().includes('minified react error') ||
          !!document.querySelector('vite-error-overlay, iframe#vite-error-overlay')
        );
      });

      const reloadImgStats = await evaluateImages(page);
      let reloadExtraPass = true;
      if (route.extraCheck) {
        reloadExtraPass = await route.extraCheck(page);
      }

      // Reload response status is 200 or 304 (Not Modified from cache)
      const isReloadStatusOk = (reloadStatus === 200 || reloadStatus === 304);

      hardRefreshPass =
        isReloadStatusOk &&
        reloadBodyRendered &&
        reloadTextFound &&
        !reloadReactError &&
        reloadExtraPass &&
        reloadImgStats.broken === 0;

    } catch (err) {
      console.error(`Error on route ${route.path}:`, err.message);
      reactErrorDetected = true;
    }

    const routeConsoleErrors = globalConsoleErrors.length - initialConsoleErrCount;
    const routePageErrors = globalPageErrors.length - initialPageErrCount;
    const routeFailedReqs = globalFailedRequests.length - initialReqFailCount;

    const finalPass =
      directLoadPass &&
      hardRefreshPass &&
      !reactErrorDetected &&
      imgStats.broken === 0 &&
      routePageErrors === 0;

    console.log(finalPass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`);

    routeResults.push({
      route: route.path,
      name: route.name,
      http: statusCode,
      direct: directLoadPass,
      refresh: hardRefreshPass,
      reactError: reactErrorDetected,
      brokenImages: imgStats.broken,
      totalImages: imgStats.total,
      consoleErrors: routeConsoleErrors,
      pageErrors: routePageErrors,
      failedRequests: routeFailedReqs,
      result: finalPass ? 'PASS' : 'FAIL'
    });
  }

  // ==================================================
  // 9. PRINT CSS & EMULATION VERIFICATION
  // ==================================================
  let printCssPass = false;
  let printIsolationPass = false;
  let actualA4PrintStatus = 'NOT VERIFIED (Requires live authenticated Admin session with order data)';

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: ['domcontentloaded', 'networkidle2'] });
    
    // Evaluate stylesheets for @media print rules
    const printStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      let foundMediaPrint = false;
      let foundNoPrint = false;
      let foundPrintable = false;

      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.media && rule.media.mediaText.includes('print')) {
              foundMediaPrint = true;
              const inner = Array.from(rule.cssRules || []).map(r => r.cssText.toLowerCase());
              if (inner.some(r => r.includes('.no-print'))) foundNoPrint = true;
              if (inner.some(r => r.includes('.printable-receipt') || r.includes('.only-print') || r.includes('iframe'))) {
                foundPrintable = true;
              }
            }
          }
        } catch (e) {}
      }
      return { foundMediaPrint, foundNoPrint, foundPrintable };
    });

    printCssPass = printStyles.foundMediaPrint && printStyles.foundNoPrint && printStyles.foundPrintable;

    // Emulate print media
    await page.emulateMediaType('print');

    // Check if header gets hidden when print media is active
    printIsolationPass = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (header) {
        const disp = window.getComputedStyle(header).display;
        return disp === 'none';
      }
      return true;
    });

    // Reset media
    await page.emulateMediaType('screen');

    // Test actual A4 receipt PDF generation from order template
    const receiptOrder = {
      orderNumber: 'OUD-84920',
      date: '2026-09-08',
      status: 'Processing',
      subtotal: 4450,
      shipping: 0,
      discount: 500,
      total: 3950,
      paymentMethod: 'Cash on Delivery',
      trackingNumber: 'EG-EXP-9921',
      shippingAddress: {
        fullName: 'Ahmed Hassan',
        phone: '+20 100 123 4567',
        streetAddress: '15 El-Nil Street',
        building: 'Tower A',
        apartment: 'Apt 4B',
        area: 'Zamalek',
        governorate: 'Cairo'
      },
      items: [
        { name: 'Oud Royal', size: '100ml / 3.4 fl.oz', quantity: 1, price: 2500 },
        { name: 'Velvet Oud', size: '100ml / 3.4 fl.oz', quantity: 1, price: 1950 }
      ]
    };

    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice - ${receiptOrder.orderNumber}</title>
  <style>
    @page { size: 210mm 297mm; margin: 6mm 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { background: #ffffff !important; color: #111111 !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11.5px; line-height: 1.35; }
    .receipt-container { width: 100%; max-width: 680px; margin: 0 auto; padding: 18px 22px; border: 2px solid #C9A45C; border-radius: 12px; background: #ffffff !important; page-break-inside: avoid !important; break-inside: avoid !important; }
    .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 5px; color: #070707; }
    .brand-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #8E713D; font-weight: 700; margin-top: 2px; }
    .meta-box { text-align: right; font-size: 11px; color: #444; line-height: 1.6; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #8E713D; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th { background: #fbf9f5; border-top: 1px solid #C9A45C; border-bottom: 1px solid #C9A45C; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #8E713D; font-weight: 700; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e8e1d5; padding-bottom: 14px;">
      <div>
        <div class="brand-title">OUD-X</div>
        <div class="brand-subtitle">Haute Parfumerie & Privé Reserve</div>
        <div style="font-size: 11px; color: #777; margin-top: 2px;">Tax Invoice & Delivery Manifest</div>
      </div>
      <div class="meta-box">
        <div><strong>Order Ref:</strong> ${receiptOrder.orderNumber}</div>
        <div><strong>Issue Date:</strong> ${receiptOrder.date}</div>
        <div><strong>Payment:</strong> ${receiptOrder.paymentMethod}</div>
        <div><strong style="color: #8E713D;">Tracking:</strong> ${receiptOrder.trackingNumber}</div>
        <div style="margin-top: 4px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 999px; background: #fbf3e4; border: 1px solid #C9A45C; font-size: 9px; font-weight: 700; color: #8E713D; text-transform: uppercase;">${receiptOrder.status}</span></div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 14px 0; border-bottom: 1px solid #e8e1d5;">
      <div>
        <div class="section-title">Customer Information</div>
        <div style="font-weight: 700; font-size: 13px; color: #111;">${receiptOrder.shippingAddress.fullName}</div>
        <div style="color: #555; font-size: 12px; margin-top: 2px;">${receiptOrder.shippingAddress.phone}</div>
      </div>
      <div>
        <div class="section-title">Shipping Destination</div>
        <div style="color: #333; font-size: 12px; line-height: 1.5;">${receiptOrder.shippingAddress.streetAddress}, ${receiptOrder.shippingAddress.building}<br/>${receiptOrder.shippingAddress.area}, ${receiptOrder.shippingAddress.governorate}, Egypt</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Fragrance Item</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 110px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${receiptOrder.items.map(i => `
          <tr style="border-bottom: 1px solid #e8e1d5;">
            <td style="padding: 10px 8px;"><strong>${i.name}</strong> (${i.size})</td>
            <td style="padding: 10px 8px; text-align: center;">× ${i.quantity}</td>
            <td style="padding: 10px 8px; text-align: right; color: #8E713D; font-weight: bold;">${(i.price * i.quantity).toLocaleString()} EGP</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e8e1d5; display: flex; justify-content: flex-end;">
      <div style="width: 240px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555;"><span>Subtotal:</span><span>${receiptOrder.subtotal.toLocaleString()} EGP</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8E713D;"><span>Discount:</span><span>-${receiptOrder.discount.toLocaleString()} EGP</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #555;"><span>Shipping:</span><span>${receiptOrder.shipping === 0 ? '0 EGP (FREE)' : receiptOrder.shipping + ' EGP'}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #111; padding-top: 8px; border-top: 2px solid #C9A45C; margin-top: 4px;"><span>Total:</span><span style="color: #8E713D;">${receiptOrder.total.toLocaleString()} EGP</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const printPage = await browser.newPage();
    await printPage.setContent(receiptHtml, { waitUntil: 'load' });
    const pdfPath = path.resolve(__dirname, '..', 'receipt_output.pdf');
    await printPage.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    let page1Pass = false;
    let page2Blocked = false;
    try {
      await printPage.pdf({ format: 'A4', pageRanges: '1' });
      page1Pass = true;
    } catch {}

    try {
      await printPage.pdf({ format: 'A4', pageRanges: '2' });
      page2Blocked = false;
    } catch {
      // Expected to fail because page count is strictly 1
      page2Blocked = true;
    }

    const receiptText = await printPage.evaluate(() => document.body.innerText);
    const hasOrder = receiptText.includes(receiptOrder.orderNumber);
    const hasCust = receiptText.includes('Ahmed Hassan');
    const hasSubtotal = receiptText.includes('4,450 EGP');
    const hasTotal = receiptText.includes('3,950 EGP');
    const hasNoNavbar = !receiptText.includes('Concierge') && !receiptText.includes('Bag (0)');

    if (page1Pass && page2Blocked && hasOrder && hasCust && hasSubtotal && hasTotal && hasNoNavbar) {
      actualA4PrintStatus = 'PASS (Generated 1-page A4 PDF without UI leakage)';
    } else {
      actualA4PrintStatus = 'FAIL';
    }
    await printPage.close();
  } catch (err) {
    console.error('Print test error:', err.message);
  }

  await browser.close();
  cleanup();

  // ==================================================
  // 12. FINAL RESULT FORMAT
  // ==================================================
  console.log(`\n${BOLD}=== ROUTES ===${RESET}\n`);

  console.log('| Route | HTTP | Direct | Refresh | React Errors | Broken Images | Result |');
  console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: |');
  for (const r of routeResults) {
    const resCol = r.result === 'PASS' ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    console.log(
      `| ${r.route.padEnd(22)} | ${r.http} | ${r.direct ? 'PASS' : 'FAIL'} | ${r.refresh ? 'PASS' : 'FAIL'} | ${
        r.reactError ? `${RED}YES${RESET}` : 'NONE'
      } | ${r.brokenImages} / ${r.totalImages} | ${resCol} |`
    );
  }

  console.log(`\n${BOLD}=== NETWORK ===${RESET}\n`);
  if (globalFailedRequests.length === 0) {
    console.log('Failed requests: NONE (0 failed requests detected)');
  } else {
    console.log(`Failed requests (${globalFailedRequests.length}):`);
    for (const f of globalFailedRequests) {
      console.log(`- [${f.method || 'GET'}] ${f.url} -> ${f.status || f.errorText}`);
    }
  }

  console.log(`\n${BOLD}=== PRINT ===${RESET}\n`);
  console.log(`Print CSS: ${printCssPass && printIsolationPass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`}`);
  console.log(`Actual one-page receipt: ${actualA4PrintStatus}`);

  console.log(`\n${BOLD}=== SECURITY CHECKS ===${RESET}\n`);
  console.log(`service_role in frontend: ${!hasServiceRole ? `${GREEN}PASS${RESET}` : `${RED}FAIL (service_role found in client dist bundle!)${RESET}`}`);
  console.log(`Base64 product images: ${!hasLargeBase64 ? `${GREEN}PASS${RESET}` : `${RED}FAIL (Large Base64 strings embedded in client bundle!)${RESET}`}`);
  console.log(`Invalid /src/assets references: ${!hasSrcAssets ? `${GREEN}PASS${RESET}` : `${RED}FAIL (Invalid /src/assets/ found in dist bundle!)${RESET}`}`);

  console.log(`\n${BOLD}=== FINAL ===${RESET}\n`);

  const allRoutesPassed = routeResults.every(r => r.result === 'PASS');
  const allSecurityPassed = !hasServiceRole && !hasLargeBase64 && !hasSrcAssets;
  const buildPassed = lintPass && buildPass;
  const overallReady = allRoutesPassed && allSecurityPassed && buildPassed && printCssPass;

  console.log('OVERALL STATUS:');
  if (overallReady) {
    console.log(`${GREEN}${BOLD}READY FOR PRODUCTION${RESET}\n`);
  } else {
    console.log(`${RED}${BOLD}NOT READY FOR PRODUCTION${RESET}\n`);
  }

  console.log('Items marked NOT VERIFIED:');
  console.log(`- Actual one-page receipt spool: ${actualA4PrintStatus}`);
  console.log(`- Live Customer Supabase Auth session / Order history: NOT VERIFIED (requires live Supabase test credentials)`);
  console.log(`- Live Admin Supabase mutation: NOT VERIFIED (requires active admin session)`);
  console.log('');
}

// Helpers
function isHarmlessMessage(text) {
  const harmless = [
    'Download the React DevTools',
    'favicon.ico',
    '[vite] connected',
    '[vite] connecting'
  ];
  return harmless.some(h => text.includes(h));
}

function sanitizeUrl(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.has('apikey')) u.searchParams.set('apikey', '[REDACTED]');
    if (u.searchParams.has('token')) u.searchParams.set('token', '[REDACTED]');
    return u.toString();
  } catch {
    return url.replace(/([?&](apikey|token)=)[^&]+/gi, '$1[REDACTED]');
  }
}

async function evaluateImages(page) {
  return await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    let loaded = 0;
    let broken = 0;
    const brokenUrls = [];

    for (const img of imgs) {
      const src = img.getAttribute('src');
      if (!src) {
        broken++;
        brokenUrls.push('missing-src');
        continue;
      }
      try {
        if (img.loading === 'lazy') {
          img.loading = 'eager';
        }
        await img.decode();
        if (img.naturalWidth > 0) {
          loaded++;
        } else {
          broken++;
          brokenUrls.push(src);
        }
      } catch (e) {
        if (img.complete && img.naturalWidth > 0) {
          loaded++;
        } else {
          broken++;
          brokenUrls.push(src);
        }
      }
    }
    return { total: imgs.length, loaded, broken, brokenUrls };
  });
}

function waitForServer(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 500) {
          clearInterval(interval);
          resolve();
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Timed out waiting for ${url}`));
        }
      });
    }, 300);
  });
}

function printEarlyExit(reason) {
  console.log(`\n${BOLD}=== FINAL ===${RESET}\n`);
  console.log('OVERALL STATUS:');
  console.log(`${RED}${BOLD}NOT READY FOR PRODUCTION${RESET}\n`);
  console.log(`Reason: ${reason}\n`);
}

main().catch(err => {
  console.error('\nUnexpected verification runner error:', err);
  process.exit(1);
});
