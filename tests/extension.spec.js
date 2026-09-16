import {storeScreenshot} from '../scripts/store-screenshot.js';
import {test,expect,chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
let server,media,origin,liveStart;
test.beforeAll(async () => {
  media=mkdtempSync(join(tmpdir(),'iptv-fixture-'));
  for(const [label,size] of [['low','320x180'],['high','640x360']]) {
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i',`testsrc2=size=${size}:rate=25`,'-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','16','-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p','-g','50','-sc_threshold','0','-c:a','aac','-f','hls','-hls_time','2','-hls_list_size','0','-hls_segment_filename',join(media,`${label}%02d.ts`),join(media,`${label}.m3u8`)]);
  }
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',join(media,'low.m3u8'),'-c','copy',join(media,'clip.mp4')]);
  writeFileSync(join(media,'master.m3u8'),'#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=300000,RESOLUTION=320x180\nlow.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=640x360\nhigh.m3u8\n');
  server=createServer((req,res) => {
    const url=new URL(req.url,'http://local');
    res.setHeader('Cache-Control','no-store');
    if(url.pathname==='/page' || url.pathname==='/other') {
      res.setHeader('Content-Type','text/html');
      res.end('<!doctype html><title>Public IPTV test channel</title><h1>Test channel</h1><button onclick="fetch(\'/master.m3u8\')">Start channel</button>'); return;
    }
    if(url.pathname==='/auto') {res.setHeader('Content-Type','text/html');res.end('<title>Automatic capture</title><script>fetch("/master.m3u8?autoload=1")</script>');return;}
    if(url.pathname==='/iframe') {res.setHeader('Content-Type','text/html');res.end('<script>fetch("/low.m3u8?iframe=1")</script>');return;}
    if(url.pathname==='/denied.m3u8') {res.writeHead(403,{'Content-Type':'application/vnd.apple.mpegurl'});res.end('Forbidden');return;}
    if(url.pathname==='/gone.m3u8') {res.writeHead(404,{'Content-Type':'application/vnd.apple.mpegurl'});res.end('Gone');return;}
    if(url.pathname==='/live.m3u8') {
      liveStart ??= Date.now();
      const seq=Math.floor((Date.now()-liveStart)/2000);
      let body=`#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:2\n#EXT-X-MEDIA-SEQUENCE:${seq}\n#EXT-X-DISCONTINUITY-SEQUENCE:${Math.floor(seq/8)}\n`;
      for(let i=seq;i<seq+4;i++) {
        if(i>seq && i%8===0) body+='#EXT-X-DISCONTINUITY\n';
        body+=`#EXTINF:2.0,\nlow${String(i%8).padStart(2,'0')}.ts\n`;
      }
      res.setHeader('Content-Type','application/vnd.apple.mpegurl');res.end(body);return;
    }
    const name=url.pathname==='/manifest' ? 'master.m3u8' : url.pathname.slice(1);
    if(!/^[\w.-]+$/.test(name)) {res.writeHead(404);res.end();return;}
    try {
      const data=readFileSync(join(media,name));
      res.setHeader('Content-Type',name.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : name.endsWith('.mp4') ? 'video/mp4' : 'video/mp2t');
      // No CORS headers: playback must use real extension host permissions.
      res.end(data);
    } catch {res.writeHead(404);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'0.0.0.0',resolve));
  origin=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => {await new Promise(resolve=>server.close(resolve));rmSync(media,{recursive:true,force:true});});
async function launch() {
  const profile=mkdtempSync(join(tmpdir(),'iptv-browser-'));
  const extension=resolve('extension');
  const context=await chromium.launchPersistentContext(profile,{
    channel:'chromium',headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),
    args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--autoplay-policy=no-user-gesture-required'],viewport:{width:1200,height:900}
  });
  const worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const id=worker.url().split('/')[2];
  const source=await context.newPage();await source.goto(`${origin}/page`);
  const sourceTab=await worker.evaluate(async url=>(await chrome.tabs.query({url}))[0].id,`${origin}/page`);
  const popup=await context.newPage();
  await worker.evaluate(id=>chrome.tabs.update(id,{active:true}),sourceTab);
  await popup.goto(`chrome-extension://${id}/popup.html`);
  const send=(type,extra={})=>popup.evaluate(async message=>{
    const response=await chrome.runtime.sendMessage(message);
    if(response.error) throw new Error(response.error);return response.data;
  },{type,tabId:sourceTab,...extra});
  return {context,worker,id,source,sourceTab,popup,send,close:async()=>{await context.close();rmSync(profile,{recursive:true,force:true});}};
}
test('real capture UI, deduplication, filters, iframe, isolation, pause, restart and cleanup',async ({},testInfo) => {
  const app=await launch();const {source,popup,send,context,worker,sourceTab}=app;
  try {
    await expect(popup.locator('#toggle')).toHaveText('Pause capture');
    await source.getByRole('button').click();await expect(popup.locator('.stream')).toHaveCount(1);
    await source.getByRole('button').click();await expect(popup.locator('.stream')).toHaveCount(1);
    await source.evaluate(()=>Promise.all(['/manifest?token=a%2Bb','/clip.mp4','/low00.ts'].map(url=>fetch(url))));
    await expect(popup.locator('.stream')).toHaveCount(3);
    await popup.locator('#kind').selectOption('HLS');await expect(popup.locator('.stream')).toHaveCount(2);
    await popup.locator('#search').fill('no-such-stream');await expect(popup.locator('#empty')).toBeVisible();
    await popup.locator('#search').fill('');await popup.locator('#kind').selectOption('');
    await source.evaluate(url=>{const iframe=document.createElement('iframe');iframe.src=url;document.body.append(iframe);},origin.replace('127.0.0.1','localhost')+'/iframe');
    await expect(popup.locator('.stream')).toHaveCount(4);
    expect(await popup.locator('body').evaluate(el=>el.scrollHeight)).toBeLessThanOrEqual(600);
    await popup.locator('body').screenshot({path:testInfo.outputPath('finder.png')});
    await storeScreenshot(popup,'01-discover','Find the stream.','Automatic capture as pages load. Search, filter and copy detected video URLs.');
    const other=await context.newPage();await other.goto(`${origin}/other`);await other.evaluate(()=>fetch('/high.m3u8?other=1'));
    expect((await send('get')).streams).toHaveLength(4);
    await popup.locator('#toggle').click();await source.evaluate(()=>fetch('/high.m3u8?paused=1'));expect((await send('get')).streams).toHaveLength(4);
    await source.reload();expect((await send('get')).enabled).toBe(false);
    await source.evaluate(()=>fetch('/high.m3u8?still-paused=1'));
    expect((await send('get')).streams).toHaveLength(0);
    const cdp=await context.newCDPSession(source);await cdp.send('ServiceWorker.enable');await cdp.send('ServiceWorker.stopAllWorkers');
    expect((await send('get')).enabled).toBe(false); // Wakes worker; pause survives.
    await popup.locator('#clear').click();await expect(popup.locator('.stream')).toHaveCount(0);
    await popup.locator('#reload').click();await source.waitForLoadState('load');
    await source.getByRole('button').click();await expect(popup.locator('.stream')).toHaveCount(1);
    await source.goto(`${origin}/other`);await expect(popup.locator('.stream')).toHaveCount(0);
    await source.close();
    expect(await popup.evaluate(async id=>(await chrome.storage.session.get(`tab:${id}`))[`tab:${id}`],sourceTab)).toBeUndefined();
  } finally {await app.close();}
});
test('captured HLS actually decodes, quality switches, direct video and error recovery',async ({},testInfo) => {
  const app=await launch();const {source,popup,context,send}=app;
  try {
    await source.getByRole('button').click();await expect(popup.locator('.stream')).toHaveCount(1);
    const pageCount=context.pages().length;
    const errors=[];popup.on('pageerror',error=>errors.push(error.message));
    await popup.getByRole('button',{name:'Play ▶',exact:true}).click();
    const player=popup.frameLocator('#player-frame');
    await expect(popup.locator('#inline-player')).toBeVisible();
    expect(context.pages()).toHaveLength(pageCount);
    await expect.poll(()=>player.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(1);
    await expect.poll(()=>player.locator('video').evaluate(v=>v.videoWidth)).toBeGreaterThan(0);
    await expect(player.locator('#source')).toHaveAttribute('href',`${origin}/page`);
    await expect(player.locator('#quality option')).toHaveCount(3);
    await player.locator('#quality').selectOption('0');await expect.poll(()=>player.locator('video').evaluate(v=>v.videoWidth)).toBe(320);
    await popup.screenshot({path:testInfo.outputPath('player.png')});
    await storeScreenshot(popup,'02-play','Play in the popup.','Preview a captured stream, choose a quality and return to your results.');
    // Playback requests must not feed back into source-page captures.
    expect((await send('get')).streams).toHaveLength(1);
    await player.locator('#url').fill(`${origin}/live.m3u8`);await player.getByRole('button',{name:'Load stream',exact:true}).click();
    await expect(player.locator('#status')).toHaveText('Playing · Live');
    const initial=await player.locator('video').evaluate(v=>v.currentTime);
    await expect.poll(()=>player.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(initial+5);
    await player.locator('#url').fill(`${origin}/denied.m3u8`);await player.getByRole('button',{name:'Load stream',exact:true}).click();
    await expect(player.locator('#error')).toContainText('authorization');
    await player.locator('#retry').click();await expect(player.locator('#error')).toContainText('authorization');
    await player.locator('#url').fill(`${origin}/clip.mp4`);await player.getByRole('button',{name:'Load stream',exact:true}).click();
    await expect.poll(()=>player.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(1);await expect(player.locator('#error')).toBeHidden();
    expect(await player.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await popup.locator('#back-to-streams').click();
    await expect(popup.locator('#inline-player')).toBeHidden();
    await expect(popup.locator('.stream')).toHaveCount(1);
    await expect(popup.locator('#player-frame')).not.toHaveAttribute('src',/.+/);
    await popup.locator('#open-player').click();
    await expect(player.locator('#video-empty')).toBeVisible();
    expect(context.pages()).toHaveLength(pageCount);
    expect(errors).toEqual([]);
  } finally {await app.close();}
});

test('captures page-load requests without opening the popup',async () => {
  const app=await launch();
  try {
    await app.popup.close();
    const page=await app.context.newPage();
    await page.goto(`${origin}/auto`);
    const tabId=await app.worker.evaluate(async url=>(await chrome.tabs.query({url}))[0].id,`${origin}/auto`);
    await expect.poll(()=>app.worker.evaluate(async id=>(await chrome.storage.session.get(`tab:${id}`))[`tab:${id}`]?.streams.map(s=>s.url),tabId)).toEqual([`${origin}/master.m3u8?autoload=1`]);
  } finally {await app.close();}
});
