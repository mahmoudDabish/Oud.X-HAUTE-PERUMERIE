const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 4176;
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

async function auditRouteOnce(browser, routePath, viewport, options = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);

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
  };

  const requestedUrls = new Map();

  page.on('request', req => {
    networkStats.totalRequests++;
    const url = req.url();
    if (url.includes('.supabase.co')) {
      networkStats.supabaseRequests++;
    }
    const cleanUrl = url.split('?')[0];
    requestedUrls.set(cleanUrl, (requestedUrls.get(cleanUrl) || 0) + 1);
  });

  page.on('response', resp => {
    if (resp.status() >= 400) networkStats.failedRequests++;
    try {
      const headers = resp.headers();
      const len = parseInt(headers['content-length'] || '0', 10);
      const ct = headers['content-type'] || '';
      const url = resp.url();

      networkStats.totalBytes += len;
      if (ct.includes('javascript') || url.endsWith('.js')) {
        networkStats.jsBytes += len;
      } else if (ct.includes('css') || url.endsWith('.css')) {
        networkStats.cssBytes += len;
      } else if (ct.includes('image') || /\.(png|jpe?g|webp|svg|gif|avif)/i.test(url)) {
        networkStats.imageBytes += len;
      }
    } catch {}
  });

  // Track Layout Shifts with exact sources & Long Tasks
  await page.evaluateOnNewDocument(() => {
    window.__perf = {
      lcp: 0,
      cls: 0,
      shifts: [],
      longTasks: 0,
      longTaskDuration: 0,
      maxLongTask: 0,
      tbt: 0
    };

    try {
      const lcpObs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          window.__perf.lcp = entries[entries.length - 1].startTime;
        }
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });

      const clsObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perf.cls += entry.value;
            const shiftSources = (entry.sources || []).map(s => {
              let desc = 'unknown';
              if (s.node) {
                const n = s.node;
                const tag = n.tagName || '';
                const id = n.id ? `#${n.id}` : '';
                const cls = n.className && typeof n.className === 'string' ? `.${n.className.split(' ').slice(0, 3).join('.')}` : '';
                desc = `${tag}${id}${cls}`;
              }
              return {
                element: desc,
                prevY: s.previousRect ? s.previousRect.y : 0,
                currY: s.currentRect ? s.currentRect.y : 0,
                dy: (s.currentRect ? s.currentRect.y : 0) - (s.previousRect ? s.previousRect.y : 0)
              };
            });
            window.__perf.shifts.push({ value: entry.value, time: entry.startTime, sources: shiftSources });
          }
        }
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });

      const ltObs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__perf.longTasks++;
          window.__perf.longTaskDuration += entry.duration;
          if (entry.duration > 50) {
            window.__perf.tbt += (entry.duration - 50);
          }
          if (entry.duration > window.__perf.maxLongTask) {
            window.__perf.maxLongTask = entry.duration;
          }
        }
      });
      ltObs.observe({ type: 'longtask', buffered: true });
    } catch {}
  });

  await page.goto(`${BASE_URL}${routePath}`, { waitUntil: 'networkidle2', timeout: 30000 });

  if (options.action) {
    await options.action(page);
  }

  // Measure INP/interaction latency by clicking a button
  let interactionLatency = 0;
  try {
    const clickTarget = await page.$('button, a');
    if (clickTarget) {
      const t0 = Date.now();
      await clickTarget.hover().catch(() => {});
      interactionLatency = Date.now() - t0;
    }
  } catch {}

  await new Promise(r => setTimeout(r, 1200));

  for (const [u, c] of requestedUrls.entries()) {
    if (c > 1 && !u.includes('.supabase.co/realtime')) {
      networkStats.duplicateRequests += (c - 1);
    }
  }

  const result = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return {
      fcp: fcp ? fcp.startTime : 0,
      lcp: window.__perf.lcp,
      cls: window.__perf.cls,
      shifts: window.__perf.shifts,
      longTasks: window.__perf.longTasks,
      totalLongTaskDuration: window.__perf.longTaskDuration,
      tbt: window.__perf.tbt,
      maxLongTask: window.__perf.maxLongTask,
      ttfb: nav.responseStart ? (nav.responseStart - nav.requestStart) : 0,
      domNodes: document.querySelectorAll('*').length
    };
  });

  await page.close();

  return {
    ...result,
    ...networkStats,
    inp: interactionLatency
  };
}

async function runValidationSuite() {
  console.log(`\n======================================================`);
  console.log(`     FINAL PRODUCTION PERFORMANCE VALIDATION SUITE    `);
  console.log(`======================================================\n`);

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

  await waitForServer(BASE_URL, 15000);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { key: 'm375', name: '375x812', width: 375, height: 812, isMobile: true, hasTouch: true },
    { key: 'm390', name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
    { key: 'd1440', name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false }
  ];

  const routes = [
    { key: 'home', name: 'Home', path: '/' },
    { key: 'shop', name: 'Shop', path: '/shop' },
    { key: 'collection', name: 'Collection', path: '/collections/oud' },
    { key: 'pdp', name: 'Product Detail', path: '/products/badee-al-oud-oud-for-glory' },
    { key: 'cart', name: 'Cart', path: '/cart' },
    { key: 'checkout', name: 'Checkout', path: '/checkout' },
    { key: 'account', name: 'Account', path: '/account' },
    {
      key: 'search',
      name: 'Search Interaction',
      path: '/',
      action: async (page) => {
        await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label*="Search"], button[aria-label*="search"]');
          if (btn) btn.click();
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
      name: 'Arabic RTL Home',
      path: '/',
      action: async (page) => {
        await page.evaluate(() => {
          const btn = document.querySelector('button[title*="اللغة"]') || 
                      document.querySelector('button[aria-label*="العربية"]') ||
                      document.querySelector('button[aria-label*="language"]');
          if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 300));
        await page.evaluate(() => {
          const ar = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('العربية'));
          if (ar) ar.click();
        });
        await new Promise(r => setTimeout(r, 500));
      }
    }
  ];

  const fullReport = {};

  for (const r of routes) {
    fullReport[r.key] = {};
    for (const vp of viewports) {
      process.stdout.write(`Testing [${r.name}] on [${vp.name}] (3 runs)... `);
      const runsData = [];
      for (let i = 0; i < 3; i++) {
        const data = await auditRouteOnce(browser, r.path, vp, {
          action: r.action,
          cpuThrottlingRate: vp.isMobile ? 2 : 1
        });
        runsData.push(data);
      }

      // Compute statistics across 3 runs
      const fcps = runsData.map(d => d.fcp).sort((a,b) => a-b);
      const lcps = runsData.map(d => d.lcp).sort((a,b) => a-b);
      const clss = runsData.map(d => d.cls).sort((a,b) => a-b);
      const tbts = runsData.map(d => d.tbt).sort((a,b) => a-b);

      const median = runsData[1];
      const aggregated = {
        fcpRange: `${Math.round(fcps[0])}–${Math.round(fcps[2])}ms`,
        fcpMedian: Math.round(fcps[1]),
        lcpRange: `${Math.round(lcps[0])}–${Math.round(lcps[2])}ms`,
        lcpMedian: Math.round(lcps[1]),
        clsRange: `${clss[0].toFixed(3)}–${clss[2].toFixed(3)}`,
        clsMedian: parseFloat(clss[1].toFixed(3)),
        tbtMedian: Math.round(tbts[1]),
        ttfbMedian: Math.round(median.ttfb),
        inpMedian: Math.round(median.inp),
        jsBytes: median.jsBytes,
        cssBytes: median.cssBytes,
        imageBytes: median.imageBytes,
        totalRequests: median.totalRequests,
        supabaseRequests: median.supabaseRequests,
        duplicateRequests: median.duplicateRequests,
        failedRequests: median.failedRequests,
        longTasks: median.longTasks,
        domNodes: median.domNodes,
        shifts: runsData[0].shifts // Shift details from first run
      };

      fullReport[r.key][vp.key] = aggregated;

      console.log(`FCP: ${aggregated.fcpMedian}ms | LCP: ${aggregated.lcpMedian}ms | CLS: ${aggregated.clsMedian} (${aggregated.clsRange}) | TBT: ${aggregated.tbtMedian}ms | Nodes: ${aggregated.domNodes}`);
    }
  }

  await browser.close();
  cleanup();

  const outPath = path.resolve(__dirname, '../final_validation_report.json');
  fs.writeFileSync(outPath, JSON.stringify(fullReport, null, 2));
  console.log(`\nFinal validation report saved to ${outPath}\n`);
}

runValidationSuite().catch(console.error);
