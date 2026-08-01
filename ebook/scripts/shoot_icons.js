const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, '..', 'assets', 'icons');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 300, height: 300 } });
  await page.goto('file://' + path.join(__dirname, 'icons.html'));
  await page.waitForTimeout(150);
  for (let i = 1; i <= 13; i++) {
    const el = await page.$(`#icon-${i}`);
    await el.screenshot({ path: path.join(outDir, `block-${i}.png`), omitBackground: true });
  }
  await browser.close();
  console.log('icons saved');
})();
