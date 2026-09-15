import {httpURL,classify,streamName,friendlyError} from './core.js';
const $ = id => document.getElementById(id),video = $('video');
let hls,currentURL,generation = 0,metadata,watchdog,isLive = false;
function status(text) { $('status').textContent = text; }
function fail(text) { clearTimeout(watchdog); $('error').hidden = false; $('error').textContent = text; status('Unable to play'); }
async function play(run) {
  try { await video.play(); }
  catch(error) {
    if (run !== generation) return;
    if (error.name === 'NotAllowedError') { clearTimeout(watchdog); status('Ready — press play'); }
    else if(error.name !== 'AbortError') fail('Press play to try again, or open the original page.');
  }
}
function load(value,kind) {
  const url = httpURL(value);
  if (!url) { fail('Enter an HTTP or HTTPS stream URL without embedded account credentials.'); return; }
  generation++; const run = generation; isLive = false;
  clearTimeout(watchdog); hls?.destroy(); hls = null;
  video.pause(); video.removeAttribute('src'); video.load();
  currentURL = url; $('url').value = url; $('error').hidden = true;
  $('video-empty').hidden = true; $('retry').disabled = $('copy').disabled = false;
  $('quality').replaceChildren(new Option('Auto','-1')); $('quality').disabled = true;
  $('stream-title').textContent = metadata?.url === url ? metadata.pageTitle : streamName(url);
  $('source').hidden = !(metadata?.url === url && httpURL(metadata.pageUrl));
  if (!$('source').hidden) $('source').href = metadata.pageUrl;
  status('Connecting…');
  watchdog = setTimeout(() => { if(run === generation) fail('The stream is taking too long to load. Retry or open the original page.'); },25000);
  const type = kind || classify(url) || 'HLS';
  if (type === 'HLS' && globalThis.Hls?.isSupported()) {
    hls = new Hls({enableWorker:false,backBufferLength:30,xhrSetup(xhr) { xhr.withCredentials = false; }});
    hls.on(Hls.Events.LEVEL_LOADED,(_event,data) => {
      if(run !== generation) return;
      isLive = data.details.live;
      if(!video.paused && !video.seeking && $('error').hidden) status(isLive ? 'Playing · Live' : 'Playing');
    });
    hls.on(Hls.Events.MANIFEST_PARSED,(_event,data) => {
      if (run !== generation) return;
      data.levels.forEach((level,index) => $('quality').add(new Option(level.height ? `${level.height}p` : `${Math.round(level.bitrate/1000)} kbps`,String(index))));
      $('quality').disabled = data.levels.length < 2; status('Ready — press play'); play(run);
    });
    hls.on(Hls.Events.ERROR,(_event,data) => {
      if (run !== generation || !data.fatal) return;
      fail(friendlyError(data.response?.code)); hls?.destroy(); hls = null;
    });
    hls.loadSource(url); hls.attachMedia(video);
  } else if (type !== 'HLS' || video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url; play(run);
  } else { fail('This browser cannot play HLS. Use an up-to-date Chrome browser.'); }
}
video.addEventListener('playing',() => { clearTimeout(watchdog); $('error').hidden = true; status(isLive || video.duration === Infinity ? 'Playing · Live' : 'Playing'); });
video.addEventListener('pause',() => { if (currentURL && !video.ended && $('error').hidden) status('Paused'); });
video.addEventListener('waiting',() => { if ($('error').hidden) status('Buffering…'); });
video.addEventListener('ended',() => status('Playback ended'));
video.addEventListener('error',() => { if (currentURL && !hls) fail(friendlyError()); });
$('load-form').onsubmit = event => { event.preventDefault(); load($('url').value.trim()); };
$('retry').onclick = () => load(currentURL,metadata?.url === currentURL ? metadata.kind : undefined);
$('quality').onchange = () => { if (hls) hls.currentLevel = Number($('quality').value); };
$('copy').onclick = async () => { try { await navigator.clipboard.writeText(currentURL); status('Stream URL copied'); } catch { fail('Copy failed. Select and copy the address above.'); } };
window.addEventListener('pagehide',() => { clearTimeout(watchdog); hls?.destroy(); });
const params = new URLSearchParams(location.search);
if (params.get('embedded') === '1') document.body.classList.add('embedded');
if (params.has('tab') && params.has('id')) {
  try {
    const response = await chrome.runtime.sendMessage({type:'get',tabId:Number(params.get('tab'))});
    if (response.error) throw new Error(response.error);
    metadata = response.data.streams.find(item => item.id === params.get('id'));
    if (!metadata) throw new Error('This capture has been cleared. Return to the source page and capture it again.');
    load(metadata.url,metadata.kind);
  } catch(error) { fail(error.message); }
}
