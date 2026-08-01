const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 2828 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'cover.html'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(__dirname, '..', 'assets', 'cover.png') });
  await browser.close();
  console.log('cover saved');
})();
