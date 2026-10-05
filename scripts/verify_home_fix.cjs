const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 4176;
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

async function run() {
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
  process.on('SIGINT', () => { cleanup(); process.exit(0); });

  await waitForServer(BASE_URL, 15000);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const testCases = [
    { name: 'Home English', url: `${BASE_URL}/`, width: 375, height: 812, isMobile: true, lang: 'en' },
    { name: 'Home English', url: `${BASE_URL}/`, width: 390, height: 844, isMobile: true, lang: 'en' },
    { name: 'Home English', url: `${BASE_URL}/`, width: 1440, height: 900, isMobile: false, lang: 'en' },
    { name: 'Home Arabic', url: `${BASE_URL}/`, width: 375, height: 812, isMobile: true, lang: 'ar' },
    { name: 'Home Arabic', url: `${BASE_URL}/`, width: 390, height: 844, isMobile: true, lang: 'ar' },
    { name: 'Home Arabic', url: `${BASE_URL}/`, width: 1440, height: 900, isMobile: false, lang: 'ar' },
  ];

  const results = [];

  for (const tc of testCases) {
    console.log(`\n======================================================`);
    console.log(`TESTING: ${tc.name} [${tc.width}x${tc.height}] (${tc.lang.toUpperCase()})`);
    console.log(`======================================================`);

    const runMetrics = [];

    // Run 3 iterations per case to capture range and stability
    for (let i = 1; i <= 3; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: tc.width, height: tc.height, isMobile: tc.isMobile });

      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('requestfailed', req => {
        failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`);
      });

      // Inject language preference and detailed layout shift observer before page loads
      await page.evaluateOnNewDocument((lang) => {
        localStorage.setItem('oud_lang', lang);
        localStorage.setItem('i18nextLng', lang);

        window.__shifts = [];
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              const shiftDetails = {
                value: entry.value,
                startTime: entry.startTime,
                sources: (entry.sources || []).map(s => {
                  let elDesc = 'unknown';
                  if (s.node) {
                    const node = s.node;
                    const tag = node.tagName || '';
                    const id = node.id ? `#${node.id}` : '';
                    const cls = node.className && typeof node.className === 'string' ? `.${node.className.split(' ').slice(0, 3).join('.')}` : '';
                    elDesc = `${tag}${id}${cls}`;
                  }
                  return {
                    element: elDesc,
                    prevRect: s.previousRect ? { x: s.previousRect.x, y: s.previousRect.y, w: s.previousRect.width, h: s.previousRect.height } : null,
                    currRect: s.currentRect ? { x: s.currentRect.x, y: s.currentRect.y, w: s.currentRect.width, h: s.currentRect.height } : null
                  };
                })
              };
              window.__shifts.push(shiftDetails);
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      }, tc.lang);

      const navStart = Date.now();
      await page.goto(tc.url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Settle duration to catch late shifts
      await new Promise(r => setTimeout(r, 2000));

      // Test basic interaction latency / INP proxy
      const interactionLatency = await page.evaluate(async () => {
        const start = performance.now();
        const btn = document.querySelector('button, a');
        if (btn) {
          btn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
          btn.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
        }
        await new Promise(r => requestAnimationFrame(r));
        return Math.round(performance.now() - start);
      });

      const metrics = await page.evaluate(() => {
        const navEntries = performance.getEntriesByType('navigation');
        const nav = navEntries[0] || {};
        const ttfb = nav.responseStart ? Math.round(nav.responseStart - nav.requestStart) : 0;

        let fcp = 0;
        const paintEntries = performance.getEntriesByType('paint');
        for (const p of paintEntries) {
          if (p.name === 'first-contentful-paint') fcp = Math.round(p.startTime);
        }

        // CLS sum
        let cls = 0;
        for (const s of (window.__shifts || [])) {
          cls += s.value;
        }

        // TBT calculation from Long Tasks
        let tbt = 0;
        const longTasks = performance.getEntriesByType('longtask') || [];
        for (const t of longTasks) {
          if (t.startTime > fcp && t.duration > 50) {
            tbt += (t.duration - 50);
          }
        }

        const domNodes = document.getElementsByTagName('*').length;

        return {
          fcp,
          cls: Number(cls.toFixed(4)),
          ttfb,
          tbt: Math.round(tbt),
          domNodes,
          shifts: window.__shifts || []
        };
      });

      // LCP from PerformanceObserver
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lastLcp = 0;
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            for (const entry of entries) {
              lastLcp = Math.round(entry.startTime);
            }
          });
          observer.observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(lastLcp);
          }, 300);
        });
      });

      metrics.lcp = lcp || metrics.fcp;
      metrics.inp = interactionLatency;
      metrics.consoleErrors = consoleErrors;
      metrics.failedRequests = failedRequests;

      runMetrics.push(metrics);
      await page.close();
    }

    // Compute median & range
    const clsValues = runMetrics.map(m => m.cls);
    const fcpValues = runMetrics.map(m => m.fcp);
    const lcpValues = runMetrics.map(m => m.lcp);
    const tbtValues = runMetrics.map(m => m.tbt);
    const ttfbValues = runMetrics.map(m => m.ttfb);
    const inpValues = runMetrics.map(m => m.inp);
    const domValues = runMetrics.map(m => m.domNodes);

    const median = (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };

    const summary = {
      testCase: `${tc.name} ${tc.width}x${tc.height}`,
      viewport: `${tc.width}x${tc.height}`,
      lang: tc.lang,
      cls: { median: median(clsValues), min: Math.min(...clsValues), max: Math.max(...clsValues) },
      fcp: { median: median(fcpValues), min: Math.min(...fcpValues), max: Math.max(...fcpValues) },
      lcp: { median: median(lcpValues), min: Math.min(...lcpValues), max: Math.max(...lcpValues) },
      tbt: { median: median(tbtValues), min: Math.min(...tbtValues), max: Math.max(...tbtValues) },
      ttfb: { median: median(ttfbValues), min: Math.min(...ttfbValues), max: Math.max(...ttfbValues) },
      inp: { median: median(inpValues), min: Math.min(...inpValues), max: Math.max(...inpValues) },
      domNodes: median(domValues),
      consoleErrors: runMetrics[0].consoleErrors.length,
      failedRequests: runMetrics[0].failedRequests.length,
      shiftsDetailed: runMetrics[0].shifts
    };

    results.push(summary);

    console.log(`-> CLS: ${summary.cls.median} [range: ${summary.cls.min} - ${summary.cls.max}]`);
    console.log(`-> FCP: ${summary.fcp.median}ms [range: ${summary.fcp.min} - ${summary.fcp.max}ms]`);
    console.log(`-> LCP: ${summary.lcp.median}ms [range: ${summary.lcp.min} - ${summary.lcp.max}ms]`);
    console.log(`-> TBT: ${summary.tbt.median}ms, TTFB: ${summary.ttfb.median}ms, INP: ${summary.inp.median}ms`);
    console.log(`-> DOM nodes: ${summary.domNodes}, Errors: ${summary.consoleErrors}, Failed Req: ${summary.failedRequests}`);
    if (summary.shiftsDetailed.length > 0) {
      console.log(`   Recorded shifts (${summary.shiftsDetailed.length}):`);
      for (const s of summary.shiftsDetailed) {
        console.log(`   - Val: ${s.value.toFixed(4)} at ${Math.round(s.startTime)}ms | Elements: ${s.sources.map(src => src.element).join(', ')}`);
        for (const src of s.sources) {
          if (src.prevRect && src.currRect) {
            console.log(`     from y=${Math.round(src.prevRect.y)} (h=${Math.round(src.prevRect.h)}) to y=${Math.round(src.currRect.y)} (h=${Math.round(src.currRect.h)})`);
          }
        }
      }
    } else {
      console.log(`   No layout shifts detected (0 shifts)!`);
    }
  }

  await browser.close();
  cleanup();

  const fs = require('fs');
  fs.writeFileSync(path.resolve(__dirname, '..', 'home_cls_validation.json'), JSON.stringify(results, null, 2));
  console.log(`\nValidation complete. Results saved to home_cls_validation.json\n`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
