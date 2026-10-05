const puppeteer = require('puppeteer');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');

const PORT = 4175;
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

async function diagnoseCLS(viewport, runs = 3) {
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

  await waitForServer(BASE_URL, 15000);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log(`\n======================================================`);
  console.log(`  DIAGNOSING CLS ON VIEWPORT: ${viewport.width}x${viewport.height}`);
  console.log(`======================================================\n`);

  for (let run = 1; run <= runs; run++) {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    // Track detailed layout shift sources
    await page.evaluateOnNewDocument(() => {
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
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const shifts = await page.evaluate(() => {
      let totalCls = 0;
      for (const s of window.__shifts) {
        totalCls += s.value;
      }
      return { totalCls, shifts: window.__shifts };
    });

    console.log(`[Run ${run}] Total CLS: ${shifts.totalCls.toFixed(4)} (${shifts.shifts.length} shift events)`);
    shifts.shifts.forEach((s, i) => {
      console.log(`  Event ${i + 1}: value=${s.value.toFixed(4)} at ${Math.round(s.startTime)}ms`);
      s.sources.forEach(src => {
        const prevY = src.prevRect ? src.prevRect.y : 0;
        const currY = src.currRect ? src.currRect.y : 0;
        const dy = currY - prevY;
        console.log(`    -> Element: <${src.element}>`);
        console.log(`       Shift delta Y: ${dy}px (prev: y=${prevY}, curr: y=${currY})`);
        console.log(`       Rect: w=${src.currRect?.w}, h=${src.currRect?.h}`);
      });
    });

    await page.close();
  }

  await browser.close();
  cleanup();
}

async function run() {
  await diagnoseCLS({ width: 375, height: 812, isMobile: true, hasTouch: true }, 2);
  await diagnoseCLS({ width: 390, height: 844, isMobile: true, hasTouch: true }, 2);
  await diagnoseCLS({ width: 1440, height: 900, isMobile: false, hasTouch: false }, 2);
}

run().catch(console.error);
