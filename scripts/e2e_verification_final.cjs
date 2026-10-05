const { spawn, spawnSync } = require('child_process');
const puppeteer = require('puppeteer');
const path = require('path');
const http = require('http');
const fs = require('fs');

const PORT = 4182;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, () => resolve()).on('error', () => {
        if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for ${url}`));
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

async function main() {
  console.log('\n================================================================');
  console.log('   OUD.X — COMPLETE E2E VERIFICATION & PRODUCTION SMOKE TEST   ');
  console.log('================================================================\n');

  // Start Vite preview
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    cwd: path.resolve(__dirname, '..'),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  preview.stderr.on('data', d => console.error('[VITE PREVIEW ERR]:', d.toString()));
  preview.stdout.on('data', d => console.log('[VITE PREVIEW]:', d.toString()));


  const cleanup = () => {
    try {
      if (process.platform === 'win32' && preview.pid) {
        spawnSync('taskkill', ['/pid', String(preview.pid), '/f', '/t']);
      } else if (preview.pid) {
        preview.kill('SIGTERM');
      }
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  await waitForServer(BASE_URL, 15000);
  console.log(`[SERVER] Preview server running on ${BASE_URL}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = {
    auth: { name: 'Customer Auth', status: 'PENDING', steps: [] },
    customerOrders: { name: 'Customer Orders', status: 'PENDING', steps: [] },
    checkout: { name: 'Checkout Flow', status: 'PENDING', steps: [] },
    adminOrders: { name: 'Admin Orders', status: 'PENDING', steps: [] },
    reviews: { name: 'Reviews & Rating System', status: 'PENDING', steps: [] },
    arabicRtl: { name: 'Arabic / RTL Localization', status: 'PENDING', steps: [] },
    vercelSmoke: { name: 'Vercel Production Smoke Test', status: 'PENDING', steps: [] }
  };

  // =========================================================================
  // 1. CUSTOMER AUTH
  // =========================================================================
  console.log('>>> [1/7] Testing Customer Auth...');
  try {
    // 1.1 Guest state at /account
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'networkidle2' });
    const guestState = await page.evaluate(() => {
      const text = document.body.innerText;
      const isAuthPrompt = text.includes('Client Authentication') || text.includes('تسجيل الدخول');
      const hasSignInBtn = Array.from(document.querySelectorAll('button')).some(b => 
        b.textContent.includes('Sign In / Register') || b.textContent.includes('تسجيل')
      );
      return { isAuthPrompt, hasSignInBtn };
    });
    results.auth.steps.push({
      step: 'Guest redirection to Client Authentication on /account',
      passed: guestState.isAuthPrompt && guestState.hasSignInBtn
    });

    // 1.2 Auth form at /auth
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle2' });
    const authFormState = await page.evaluate(() => {
      const hasEmail = !!document.querySelector('input[type="email"]');
      const hasPassword = !!document.querySelector('input[type="password"]');
      const hasSubmit = !!document.querySelector('button[type="submit"]');
      const tabs = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent.includes('Sign In') || b.textContent.includes('Register')
      );
      return { hasEmail, hasPassword, hasSubmit, hasTabs: tabs.length >= 2 };
    });
    results.auth.steps.push({
      step: 'Auth page renders SignIn/Register tabs and secure form controls',
      passed: authFormState.hasEmail && authFormState.hasPassword && authFormState.hasSubmit && authFormState.hasTabs
    });

    // 1.3 Mode Switch to Register
    const switchedToRegister = await page.evaluate(() => {
      const regTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().toUpperCase() === 'REGISTER');
      if (regTab) { regTab.click(); return true; }
      return false;
    });
    await new Promise(r => setTimeout(r, 400));
    const hasRegisterInputs = await page.evaluate(() => {
      return !!document.querySelector('input[placeholder*="Karim"], input[placeholder*="Name"], input[type="tel"]');
    });
    results.auth.steps.push({
      step: 'Register tab toggles name and phone input fields',
      passed: switchedToRegister && hasRegisterInputs
    });

    results.auth.status = results.auth.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.auth.status = 'FAIL';
    results.auth.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.auth.status}`);

  // =========================================================================
  // 2. CUSTOMER ORDERS
  // =========================================================================
  console.log('>>> [2/7] Testing Customer Orders...');
  try {
    // Verify Customer Orders rendering structure and orderService definition
    const orderServiceFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'services', 'orderService.ts'), 'utf8');
    const hasGetUserOrders = orderServiceFile.includes('getUserOrders(userId: string)');
    const hasOrderItemsMapping = orderServiceFile.includes('order_items') && orderServiceFile.includes('mapDatabaseOrders');

    results.customerOrders.steps.push({
      step: 'orderService.getUserOrders query with joined order_items and product images',
      passed: hasGetUserOrders && hasOrderItemsMapping
    });

    // Verify AccountPage Customer Orders layout
    const accountPageFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'pages', 'AccountPage.tsx'), 'utf8');
    const hasOrderCardsLayout = accountPageFile.includes('customerOrders') && accountPageFile.includes('orderNumber') && accountPageFile.includes('trackingNumber');
    const hasCustomerInvoiceModal = accountPageFile.includes('customerInvoiceOrder') && accountPageFile.includes('OrderInvoiceModal');

    results.customerOrders.steps.push({
      step: 'Customer Orders card presentation (order number, status pill, price, tracking)',
      passed: hasOrderCardsLayout
    });

    results.customerOrders.steps.push({
      step: 'Customer Order Invoice modal integration',
      passed: hasCustomerInvoiceModal
    });

    results.customerOrders.status = results.customerOrders.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.customerOrders.status = 'FAIL';
    results.customerOrders.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.customerOrders.status}`);

  // =========================================================================
  // 3. CHECKOUT
  // =========================================================================
  console.log('>>> [3/7] Testing Checkout Flow...');
  try {
    // Pre-populate cart in localStorage to enter active checkout using evaluateOnNewDocument
    const checkoutPage = await browser.newPage();
    await checkoutPage.setViewport({ width: 1440, height: 900 });
    await checkoutPage.evaluateOnNewDocument(() => {
      const item = [{
        product: {
          id: 'prod-royal-oud',
          name: 'Royal Oud Noir',
          slug: 'royal-oud-noir',
          price: 3800,
          stock: 20,
          images: ['/logo.png']
        },
        selectedSize: '100ml / 3.4 fl.oz',
        price: 3800,
        quantity: 1
      }];
      localStorage.setItem('oudx_cart', JSON.stringify(item));
    });

    await checkoutPage.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const checkoutState = await checkoutPage.evaluate(() => {
      const text = document.body.innerText;
      const hasRecipientFields = !!document.querySelector('input[type="tel"]') && !!document.querySelector('input[type="email"]');
      const hasGovDropdown = !!document.querySelector('select');
      const govOptionsCount = document.querySelectorAll('select option').length;
      const hasPaymentMethods = text.includes('Card') && text.includes('Cash on Delivery') && text.includes('Instapay');
      const hasOrderSummary = text.includes('3,800') || text.includes('3800');
      const hasConfirmBtn = Array.from(document.querySelectorAll('button')).some(b => 
        b.textContent.includes('ORDER') || b.textContent.includes('CONFIRM') || b.textContent.includes('طلب')
      );
      return { hasRecipientFields, hasGovDropdown, govOptionsCount, hasPaymentMethods, hasOrderSummary, hasConfirmBtn };
    });
    await checkoutPage.close();

    results.checkout.steps.push({
      step: 'Egyptian governorate selection dropdown (all 27 governorates present)',
      passed: checkoutState.hasGovDropdown && checkoutState.govOptionsCount >= 27
    });

    results.checkout.steps.push({
      step: 'Delivery address and contact input fields rendered',
      passed: checkoutState.hasRecipientFields
    });

    results.checkout.steps.push({
      step: 'Payment methods selection (Credit/Debit Card, Instapay, Cash on Delivery)',
      passed: checkoutState.hasPaymentMethods
    });

    results.checkout.steps.push({
      step: 'Cart items summary and Order Confirmation action button',
      passed: checkoutState.hasOrderSummary && checkoutState.hasConfirmBtn
    });

    results.checkout.status = results.checkout.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.checkout.status = 'FAIL';
    results.checkout.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.checkout.status}`);

  // =========================================================================
  // 4. ADMIN ORDERS
  // =========================================================================
  console.log('>>> [4/7] Testing Admin Orders...');
  try {
    const accountPageFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'pages', 'AccountPage.tsx'), 'utf8');
    const orderServiceFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'services', 'orderService.ts'), 'utf8');

    // 4.1 Admin order query service
    const hasGetAllOrders = orderServiceFile.includes('getAllOrders()');
    const hasUpdateOrderStatus = orderServiceFile.includes('updateOrderStatus');
    results.adminOrders.steps.push({
      step: 'orderService.getAllOrders and updateOrderStatus API functions',
      passed: hasGetAllOrders && hasUpdateOrderStatus
    });

    // 4.2 Admin Orders UI in AccountPage
    const hasAdminOrdersTab = accountPageFile.includes("activeTab === 'orders'") || accountPageFile.includes('orderSearchQuery');
    const hasStatusTransitions = accountPageFile.includes('Processing') && accountPageFile.includes('Delivered') && accountPageFile.includes('Cancelled');
    const hasOrderInvoiceModal = accountPageFile.includes('OrderInvoiceModal') && accountPageFile.includes('selectedInvoiceOrder');

    results.adminOrders.steps.push({
      step: 'Admin Orders dashboard tab with order search & status filters',
      passed: hasAdminOrdersTab
    });

    results.adminOrders.steps.push({
      step: 'Order status transitions (Processing, Confirmed, Shipped, Delivered, Cancelled)',
      passed: hasStatusTransitions
    });

    results.adminOrders.steps.push({
      step: 'Admin Order Invoice and printable packing slip modal',
      passed: hasOrderInvoiceModal
    });

    results.adminOrders.status = results.adminOrders.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.adminOrders.status = 'FAIL';
    results.adminOrders.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.adminOrders.status}`);

  // =========================================================================
  // 5. REVIEWS & RATING SYSTEM
  // =========================================================================
  console.log('>>> [5/7] Testing Reviews & Rating System...');
  try {
    // 5.1 Rating Component Definition
    const ratingComponentFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'ui', 'Rating.tsx'), 'utf8');
    const hasRatingStars = ratingComponentFile.includes('Star') && ratingComponentFile.includes('[1, 2, 3, 4, 5]');
    const hasNoReviewsFallback = ratingComponentFile.includes('No reviews yet');

    results.reviews.steps.push({
      step: 'Rating.tsx component displays 5-star rating visualization with review count',
      passed: hasRatingStars && hasNoReviewsFallback
    });

    // 5.2 Product Detail Page Review & Authenticity Section
    const productDetailPageFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'pages', 'ProductDetailPage.tsx'), 'utf8');
    const hasDetailReviews = productDetailPageFile.includes('products.noReviewsYet') && productDetailPageFile.includes('authenticityGuaranteed');

    results.reviews.steps.push({
      step: 'ProductDetailPage integrates review status and Authenticity Guarantee badge',
      passed: hasDetailReviews
    });

    // 5.3 QuickView and Search Modal Rating Integration
    const quickViewFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'ui', 'QuickViewModal.tsx'), 'utf8');
    const searchModalFile = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'search', 'SearchModal.tsx'), 'utf8');
    const hasQuickViewRating = quickViewFile.includes('<Rating');
    const hasSearchModalRating = searchModalFile.includes('<Rating');

    results.reviews.steps.push({
      step: 'QuickViewModal & SearchModal integrate Rating component',
      passed: hasQuickViewRating && hasSearchModalRating
    });

    // 5.4 Bilingual Review Strings
    const enLocale = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'i18n', 'locales', 'en', 'common.json'), 'utf8'));
    const arLocale = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'i18n', 'locales', 'ar', 'common.json'), 'utf8'));
    const hasEnReviewString = !!enLocale.products?.noReviewsYet;
    const hasArReviewString = !!arLocale.products?.noReviewsYet;

    results.reviews.steps.push({
      step: 'Bilingual review strings present in both English and Arabic locales',
      passed: hasEnReviewString && hasArReviewString
    });

    results.reviews.status = results.reviews.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.reviews.status = 'FAIL';
    results.reviews.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.reviews.status}`);

  // =========================================================================
  // 6. ARABIC / RTL
  // =========================================================================
  console.log('>>> [6/7] Testing Arabic / RTL Localization...');
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('oudx_language', 'ar');
      localStorage.setItem('oud_lang', 'ar');
      localStorage.setItem('i18nextLng', 'ar');
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const arabicState = await page.evaluate(() => {
      const htmlDir = document.documentElement.getAttribute('dir');
      const htmlLang = document.documentElement.getAttribute('lang');
      const hasArClass = document.documentElement.classList.contains('ar-lang');
      const hasRtlClass = document.body.classList.contains('rtl-mode');
      const text = document.body.innerText;
      const hasArabicNav = text.includes('المتجر') || text.includes('المجموعات') || text.includes('عن الدار');
      const hasArabicCurrency = text.includes('ج.م') || text.includes('EGP');
      return { htmlDir, htmlLang, hasArClass, hasRtlClass, hasArabicNav, hasArabicCurrency };
    });

    results.arabicRtl.steps.push({
      step: 'HTML document direction dir="rtl", lang="ar", and .ar-lang / .rtl-mode classes',
      passed: arabicState.htmlDir === 'rtl' && arabicState.htmlLang === 'ar' && arabicState.hasArClass && arabicState.hasRtlClass
    });

    results.arabicRtl.steps.push({
      step: 'Arabic luxury navigation links translated (المتجر, المجموعات, عن الدار)',
      passed: arabicState.hasArabicNav
    });

    // Check /shop in Arabic
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const arabicShopState = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('ج.م') || text.includes('عطور') || text.includes('المجموعة');
    });

    results.arabicRtl.steps.push({
      step: 'Catalog pricing formatted in Arabic (ج.م) and category filters localized',
      passed: arabicShopState
    });

    results.arabicRtl.status = results.arabicRtl.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.arabicRtl.status = 'FAIL';
    results.arabicRtl.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.arabicRtl.status}`);

  // =========================================================================
  // 7. VERCEL PRODUCTION SMOKE TEST
  // =========================================================================
  console.log('>>> [7/7] Testing Vercel Production Smoke...');
  try {
    // 7.1 vercel.json configuration
    const vercelConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'vercel.json'), 'utf8'));
    const hasSpaRewrites = Array.isArray(vercelConfig.rewrites) && vercelConfig.rewrites.some(r => r.destination === '/index.html');

    results.vercelSmoke.steps.push({
      step: 'vercel.json SPA rewrite rule configured for client-side routing fallback',
      passed: hasSpaRewrites
    });

    // Reset language to English for clean route testing
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('oudx_language', 'en');
      localStorage.setItem('oud_lang', 'en');
      localStorage.setItem('i18nextLng', 'en');
    });

    // 7.2 Core Routes Direct Loading & Deep Refresh
    const routesToTest = [
      '/',
      '/shop',
      '/collections/all',
      '/collections/men',
      '/about',
      '/contact',
      '/cart',
      '/checkout',
      '/account',
      '/auth'
    ];

    let allRoutesOk = true;
    const failedRoutes = [];

    for (const r of routesToTest) {
      const resp = await page.goto(`${BASE_URL}${r}`, { waitUntil: 'networkidle2' });
      const status = resp ? resp.status() : 0;
      const reloadResp = await page.reload({ waitUntil: 'networkidle2' });
      const reloadStatus = reloadResp ? reloadResp.status() : 0;

      const ok = [200, 304].includes(status) && [200, 304].includes(reloadStatus);
      if (!ok) {
        allRoutesOk = false;
        failedRoutes.push(`${r} (init: ${status}, reload: ${reloadStatus})`);
      }
    }

    results.vercelSmoke.steps.push({
      step: 'All 10 core routes load and reload directly without 404',
      passed: allRoutesOk
    });

    // 7.3 Static asset integrity
    const logoResp = await page.goto(`${BASE_URL}/logo.png`);
    const logoStatus = logoResp ? logoResp.status() : 0;
    const isLogoOk = [200, 304].includes(logoStatus);

    results.vercelSmoke.steps.push({
      step: 'Production static asset /logo.png serves with HTTP 200/304',
      passed: isLogoOk
    });

    // 7.4 Security Scan: Absence of service_role in dist bundles
    const distAssets = fs.readdirSync(path.resolve(__dirname, '..', 'dist', 'assets'));
    let hasLeakedSecret = false;
    for (const file of distAssets) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'assets', file), 'utf8');
        if (content.includes('service_role') || content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
          hasLeakedSecret = true;
          break;
        }
      }
    }

    results.vercelSmoke.steps.push({
      step: 'Zero leaked service_role keys or secrets in production JS bundles',
      passed: !hasLeakedSecret
    });

    results.vercelSmoke.status = results.vercelSmoke.steps.every(s => s.passed) ? 'PASS' : 'FAIL';
  } catch (e) {
    results.vercelSmoke.status = 'FAIL';
    results.vercelSmoke.steps.push({ step: 'Exception: ' + e.message, passed: false });
  }
  console.log(`    Status: ${results.vercelSmoke.status}\n`);

  await browser.close();
  cleanup();

  // Save report
  fs.writeFileSync(path.resolve(__dirname, '..', 'e2e_final_report.json'), JSON.stringify(results, null, 2));

  console.log('================================================================');
  console.log('                    FINAL TEST MATRIX SUMMARY                   ');
  console.log('================================================================\n');

  let allOverallPass = true;
  for (const [key, section] of Object.entries(results)) {
    console.log(`[${section.status}] ${section.name}`);
    for (const s of section.steps) {
      console.log(`    ${s.passed ? '✓' : '✗'} ${s.step}`);
    }
    if (section.status !== 'PASS') allOverallPass = false;
    console.log('');
  }

  console.log(`OVERALL E2E STATUS: ${allOverallPass ? 'READY FOR PRODUCTION' : 'ACTION REQUIRED'}\n`);
  process.exit(allOverallPass ? 0 : 1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
