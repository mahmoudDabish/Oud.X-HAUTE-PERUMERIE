const before = require('../baseline_before.json');
const after = require('../baseline_after.json');

console.log('| Page / Viewport | Metric | Before | After | Change |');
console.log('| :--- | :--- | :---: | :---: | :---: |');

const pages = Object.keys(before);
for (const p of pages) {
  for (const vp of ['mobileSmall', 'mobileStd']) {
    const b = before[p][vp];
    const a = after[p][vp];
    if (b && a) {
      const fcpDiff = Math.round(a.fcp - b.fcp);
      const lcpDiff = Math.round(a.lcp - b.lcp);
      const clsDiff = (a.cls - b.cls).toFixed(3);
      const nodesDiff = a.domNodes - b.domNodes;
      console.log(`| ${p} (${vp}) | FCP (ms) | ${Math.round(b.fcp)} | ${Math.round(a.fcp)} | ${fcpDiff > 0 ? '+' : ''}${fcpDiff}ms |`);
      console.log(`| ${p} (${vp}) | LCP (ms) | ${Math.round(b.lcp)} | ${Math.round(a.lcp)} | ${lcpDiff > 0 ? '+' : ''}${lcpDiff}ms |`);
      console.log(`| ${p} (${vp}) | CLS | ${b.cls.toFixed(3)} | ${a.cls.toFixed(3)} | ${clsDiff > 0 ? '+' : ''}${clsDiff} |`);
      console.log(`| ${p} (${vp}) | DOM Nodes | ${b.domNodes} | ${a.domNodes} | ${nodesDiff > 0 ? '+' : ''}${nodesDiff} |`);
    }
  }
}
