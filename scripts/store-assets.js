import {chromium} from '@playwright/test';
import {spawnSync} from 'node:child_process';
import {copyFileSync,mkdirSync,readFileSync} from 'node:fs';

mkdirSync('store/assets',{recursive:true});
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test'],{
  env:{...process.env,STORE_ASSETS:'1'},stdio:'inherit'
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
copyFileSync('extension/icons/128.png','store/assets/icon-128.png');
const logo=readFileSync('extension/icons/source.png').toString('base64');
const browser=await chromium.launch({channel:'chromium',headless:true});
try {
  const page=await browser.newPage({viewport:{width:440,height:280},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;width:440px;height:280px;background:#123e51;
    color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    display:flex;align-items:center;justify-content:center;flex-direction:column;
    background-image:radial-gradient(ellipse at top right,#236d83,transparent 70%)}
    img{width:96px;height:96px;margin-bottom:22px}h1{margin:0;font-size:27px;font-weight:400;
    letter-spacing:normal}p{margin:10px 0 0;color:#c4e4ef;font-size:14px}
  </style></head><body><img src="data:image/png;base64,${logo}" alt="">
  <h1>PublicIPTV</h1><p>Discover streams. Preview in your popup.</p></body></html>`);
  await page.locator('img').evaluate(img=>img.decode());
  await page.screenshot({path:'store/assets/promo-440x280.png'});
} finally {await browser.close();}
console.log('Store images ready in store/assets');
