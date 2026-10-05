const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 4174;
const BASE_URL = `http://localhost:${PORT}`;

function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for ${url}`));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

async function auditPage(browser, pageUrl, viewport, options = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);

  // CDPSession for performance metrics & CPU throttling if requested
  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  if (options.cpuThrottlingRate) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: options.cpuThrottlingRate });
  }

  const networkStats = {
    totalRequests: 0,
    supabaseRequests: 0,
    failedRequests: 0,
    duplicateRequests: 0,
    totalBytes: 0,
    jsBytes: 0,
    cssBytes: 0,
    imageBytes: 0,
    imageCount: 0,
    largestImage: { url: '', bytes: 0 },
    largestJs: { url: '', bytes: 0 },
    largestCss: { url: '', bytes: 0 },
    slowestRequest: { url: '', duration: 0 }
  };

  const requestedUrls = new Map();

  await page.setRequestInterception(false);

  page.on('request', req => {
    networkStats.totalRequests++;
    const url = req.url();
    if (url.includes('.supabase.co')) {
      networkStats.supabaseRequests++;
    }
    const cleanUrl = url.split('?')[0];
    requestedUrls.set(cleanUrl, (requestedUrls.get(cleanUrl) || 0) + 1);
  });

  page.on('response', async resp => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400) {
      networkStats.failedRequests++;
    }

    try {
      const headers = resp.headers();
      const contentLength = parseInt(headers['content-length'] || '0', 10);
      const ct = headers['content-type'] || '';
      
      networkStats.totalBytes += contentLength;
      
      if (ct.includes('javascript') || url.endsWith('.js')) {
        networkStats.jsBytes += contentLength;
        if (contentLength > networkStats.largestJs.bytes) {
          networkStats.largestJs = { url: path.basename(url.split('?')[0]), bytes: contentLength };
        }
      } else if (ct.includes('css') || url.endsWith('.css')) {
        networkStats.cssBytes += contentLength;
        if (contentLength > networkStats.largestCss.bytes) {
          networkStats.largestCss = { url: path.basename(url.split('?')[0]), bytes: contentLength };
        }
      } else if (ct.includes('image') || /\.(png|jpe?g|webp|svg|gif|avif)/i.test(url)) {
        networkStats.imageBytes += contentLength;
        networkStats.imageCount++;
        if (contentLength > networkStats.largestImage.bytes) {
          networkStats.largestImage = { url: path.basename(url.split('?')[0]), bytes: contentLength };
        }
      }
    } catch (e) {}
  });

  // Inject metric tracking before document load
  await page.evaluateOnNewDocument(() => {
    window.__perfMetrics = {
      lcp: 0,
      cls: 0,
      longTasks: 0,
      longTaskDuration: 0,
      maxLongTask: 0
    };

    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          window.__perfMetrics.lcp = entries[entries.length - 1].startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perfMetrics.cls += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          window.__perfMetrics.longTasks++;
          window.__perfMetrics.longTaskDuration += entry.duration;
          if (entry.duration > window.__perfMetrics.maxLongTask) {
            window.__perfMetrics.maxLongTask = entry.duration;
          }
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (e) {}
  });

  const startTime = Date.now();
  await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  // Optional custom interactions (e.g. open search, switch language)
  if (options.action) {
    await options.action(page);
  }

  // Wait a moment for layout stabilization and LCP settlement
  await new Promise(r => setTimeout(r, 1200));

  // Compute duplicate requests
  for (const [url, count] of requestedUrls.entries()) {
    if (count > 1 && !url.includes('.supabase.co/realtime')) {
      networkStats.duplicateRequests += (count - 1);
    }
  }

  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    
    return {
      fcp: fcpEntry ? fcpEntry.startTime : 0,
      lcp: window.__perfMetrics.lcp,
      cls: window.__perfMetrics.cls,
      longTasks: window.__perfMetrics.longTasks,
      totalLongTaskDuration: window.__perfMetrics.longTaskDuration,
      maxLongTask: window.__perfMetrics.maxLongTask,
      ttfb: nav.responseStart ? (nav.responseStart - nav.requestStart) : 0,
      domContentLoaded: nav.domContentLoadedEventEnd ? (nav.domContentLoadedEventEnd - nav.startTime) : 0,
      loadTime: nav.loadEventEnd ? (nav.loadEventEnd - nav.startTime) : 0,
      domNodes: document.querySelectorAll('*').length
    };
  });

  // Extract CDP performance metrics for JS execution & thread time
  const cdpMetrics = await client.send('Performance.getMetrics');
  const metricMap = {};
  for (const m of cdpMetrics.metrics) {
    metricMap[m.name] = m.value;
  }

  const jsExecutionTime = (metricMap['ScriptDuration'] || 0) * 1000;
  const layoutDuration = (metricMap['LayoutDuration'] || 0) * 1000;
  const recalcStyleDuration = (metricMap['RecalcStyleDuration'] || 0) * 1000;

  await page.close();

  return {
    ...timing,
    ...networkStats,
    jsExecutionTime: Math.round(jsExecutionTime),
    layoutDuration: Math.round(layoutDuration),
    recalcStyleDuration: Math.round(recalcStyleDuration)
  };
}

async function runBenchmark(runName = 'BEFORE') {
  console.log(`\n======================================================`);
  console.log(`   RUNNING MOBILE PERFORMANCE AUDIT: ${runName}`);
  console.log(`======================================================\n`);

  // Start Vite Preview server
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
    } catch (e) {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(); });
  process.on('SIGTERM', () => { cleanup(); process.exit(); });

  try {
    await waitForServer(BASE_URL, 15000);
    console.log(`Preview server ready at ${BASE_URL}\n`);
  } catch (err) {
    console.error('Failed to start preview server:', err);
    cleanup();
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const viewports = {
    mobileSmall: { name: '375x812 (iPhone X/Mini)', width: 375, height: 812, isMobile: true, hasTouch: true },
    mobileStd: { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844, isMobile: true, hasTouch: true },
    desktop: { name: '1440x900 (Desktop)', width: 1440, height: 900, isMobile: false, hasTouch: false }
  };

  const pagesToAudit = [
    { key: 'home', name: 'Home Page', path: '/' },
    { key: 'shop', name: 'Shop Page', path: '/shop' },
    { key: 'collection_oud', name: 'Collection (Oud)', path: '/collections/oud' },
    { key: 'pdp', name: 'Product Detail', path: '/products/badee-al-oud-oud-for-glory' },
    { key: 'cart', name: 'Cart Page', path: '/cart' },
    { key: 'checkout', name: 'Checkout Page', path: '/checkout' },
    { key: 'account', name: 'Account Page', path: '/account' },
    { 
      key: 'search_interaction', 
      name: 'Search Interaction', 
      path: '/', 
      action: async (page) => {
        // Click search icon and type query
        await page.evaluate(() => {
          const searchBtn = document.querySelector('button[aria-label*="Search"], button[aria-label*="search"]');
          if (searchBtn) searchBtn.click();
        });
        await new Promise(r => setTimeout(r, 400));
        await page.evaluate(() => {
          const input = document.querySelector('input[type="text"]');
          if (input) {
            input.value = 'oud';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        await new Promise(r => setTimeout(r, 400));
      }
    },
    { 
      key: 'arabic_home', 
      name: 'Arabic Home (RTL)', 
      path: '/', 
      action: async (page) => {
        // Switch to Arabic
        await page.evaluate(() => {
          const langBtn = document.querySelector('button[title*="اللغة"]') || 
                          document.querySelector('button[aria-label*="العربية"]') ||
                          document.querySelector('button[aria-label*="language"]');
          if (langBtn) langBtn.click();
        });
        await new Promise(r => setTimeout(r, 300));
        await page.evaluate(() => {
          const ar = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('العربية'));
          if (ar) ar.click();
        });
        await new Promise(r => setTimeout(r, 600));
      }
    }
  ];

  const results = {};

  for (const pageDef of pagesToAudit) {
    results[pageDef.key] = {};
    for (const [vpKey, vp] of Object.entries(viewports)) {
      process.stdout.write(`Testing [${pageDef.name}] on [${vp.name}]... `);
      const metrics = await auditPage(
        browser, 
        `${BASE_URL}${pageDef.path}`, 
        vp, 
        { 
          action: pageDef.action,
          cpuThrottlingRate: vp.isMobile ? 2 : 1 // 2x CPU slowdown simulating mid-range mobile SoC
        }
      );
      results[pageDef.key][vpKey] = metrics;
      console.log(`FCP: ${Math.round(metrics.fcp)}ms | LCP: ${Math.round(metrics.lcp)}ms | CLS: ${metrics.cls.toFixed(3)} | JS: ${Math.round(metrics.jsBytes/1024)}kB | Nodes: ${metrics.domNodes}`);
    }
  }

  await browser.close();
  cleanup();

  const outPath = path.resolve(__dirname, `../baseline_${runName.toLowerCase()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to ${outPath}\n`);

  return results;
}

const runArg = process.argv[2] || 'BEFORE';
runBenchmark(runArg).catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
