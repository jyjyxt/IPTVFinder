import {httpURL} from './core.js';
const $ = id => document.getElementById(id);
let tabId,state = {enabled:false,streams:[]},supported = false;
async function request(type,extra = {}) {
  const result = await chrome.runtime.sendMessage({type,tabId,...extra});
  if (result.error) throw new Error(result.error);
  return result.data;
}
function notify(text) { $('notice').textContent = text; }
function action(handler) { return async () => { try { await handler(); } catch(error) { notify(error.message); } }; }
function render() {
  $('toggle').textContent = state.enabled ? 'Pause capture' : 'Start capture';
  $('toggle').disabled = $('reload').disabled = !supported;
  $('signal').classList.toggle('on',state.enabled);
  $('capture-help').textContent = !supported ? 'Open a website to discover its video streams, or open the player to paste a URL.' : state.enabled ? 'Listening on this tab. Play a channel to find its stream.' : 'Capture is paused. Start capture, then play a video.';
  $('count').textContent = state.streams.length;
  const query = $('search').value.trim().toLowerCase(), kind = $('kind').value;
  const filtered = state.streams.filter(item => (!kind || item.kind === kind) && `${item.name} ${item.url} ${item.pageTitle}`.toLowerCase().includes(query));
  $('streams').replaceChildren(); $('empty').hidden = filtered.length > 0;
  $('empty').querySelector('h3').textContent = state.streams.length ? 'No matching streams' : 'No streams yet';
  $('empty').querySelector('p').textContent = state.streams.length ? 'Try another search or format.' : 'Start capture and press play on the website. Already playing? Reload the page to find its stream.';
  for (const item of [...filtered].reverse()) {
    const card = document.createElement('article'); card.className = 'stream';
    const top = document.createElement('div'); top.className = 'stream-heading';
    const badge = document.createElement('span'); badge.className = 'format'; badge.textContent = item.kind;
    const title = document.createElement('h3'); title.textContent = item.name; title.title = item.pageTitle;
    top.append(badge,title);
    const url = document.createElement('p'); url.className = 'stream-url'; url.textContent = item.url; url.title = item.url;
    const bottom = document.createElement('div'); bottom.className = 'stream-bottom';
    const origin = document.createElement('span'); origin.textContent = `${new URL(item.url).hostname}${item.status >= 400 ? ` · HTTP ${item.status}` : ''}`;
    const buttons = document.createElement('div'); buttons.className = 'actions';
    const copy = document.createElement('button'); copy.textContent = 'Copy';
    copy.onclick = action(async () => { await navigator.clipboard.writeText(item.url); notify('Stream URL copied.'); });
    const play = document.createElement('button'); play.className = 'primary small'; play.textContent = 'Play ▶';
    play.onclick = action(async () => { await request('play',{id:item.id}); });
    buttons.append(copy,play); bottom.append(origin,buttons); card.append(top,url,bottom); $('streams').append(card);
  }
}
$('toggle').onclick = action(async () => { state = await request('toggle',{enabled:!state.enabled}); render(); });
$('reload').onclick = action(async () => { state = await request('toggle',{enabled:true}); await chrome.tabs.reload(tabId); render(); notify('Page reloading. Press play on the website.'); });
$('clear').onclick = action(async () => { state = await request('clear'); render(); notify('Captured streams cleared.'); });
$('open-player').onclick = action(() => chrome.tabs.create({url:chrome.runtime.getURL('player.html')}));
$('search').oninput = $('kind').onchange = render;
chrome.storage.onChanged.addListener((changes,area) => {
  if (area === 'session' && changes[`tab:${tabId}`]) { state = changes[`tab:${tabId}`].newValue || {enabled:false,streams:[]}; render(); }
});
action(async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  tabId = tab?.id; supported = Boolean(httpURL(tab?.url));
  $('page-title').textContent = tab?.title || 'Open a website';
  if (Number.isInteger(tabId)) state = await request('get');
  render();
})();
