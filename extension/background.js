import {classify,httpURL,mergeStream,streamName} from './core.js';
// Serialize session writes so concurrent requests do not overwrite one another.
let queue = Promise.resolve();
function serial(task) {
  const result = queue.then(task);
  queue = result.catch(error => console.warn('IPTV Finder:',error.message));
  return result;
}
const key = id => `tab:${id}`;
const blank = (enabled = false) => ({enabled,streams:[]});
async function read(id) {
  const stored = (await chrome.storage.session.get(key(id)))[key(id)];
  if (stored) return stored;
  try {
    const tab = await chrome.tabs.get(id);
    return blank(Boolean(httpURL(tab.url)));
  } catch { return blank(); }
}
async function save(id,state) {
  await chrome.storage.session.set({[key(id)]:state});
  try {
    await chrome.action.setBadgeText({tabId:id,text:state.streams.length ? String(state.streams.length) : state.enabled ? 'ON' : ''});
    await chrome.action.setBadgeBackgroundColor({tabId:id,color:state.enabled ? '#155e75' : '#64748b'});
  } catch { /* Tab may have closed during capture. */ }
}
chrome.webRequest.onResponseStarted.addListener(details => {
  if (details.tabId < 0 || details.method === 'OPTIONS' || details.initiator === `chrome-extension://${chrome.runtime.id}`) return;
  const mime = details.responseHeaders?.find(h => h.name.toLowerCase() === 'content-type')?.value || '';
  const kind = classify(details.url,mime);
  if (!kind) return;
  serial(async () => {
    const state = await read(details.tabId);
    if (!state.enabled || details.timeStamp < (state.since || 0)) return;
    let tab;
    try { tab = await chrome.tabs.get(details.tabId); } catch { return; }
    if (!httpURL(tab.url)) return;
    state.streams = mergeStream(state.streams,{
      id:crypto.randomUUID(),url:details.url,kind,mime,name:streamName(details.url),
      pageTitle:tab.title || 'Untitled page',pageUrl:tab.url,status:details.statusCode,lastSeen:Date.now()
    });
    await save(details.tabId,state);
  });
},{urls:['http://*/*','https://*/*']},['responseHeaders']);
chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.frameId !== 0) return;
  serial(async () => {
    const stored = (await chrome.storage.session.get(key(details.tabId)))[key(details.tabId)];
    // Start before page scripts request media; preserve an explicit pause across navigation.
    if (!stored && !httpURL(details.url)) return;
    const state = stored || blank(true);
    await save(details.tabId,{...state,streams:[],since:details.timeStamp});
  });
});
chrome.tabs.onRemoved.addListener(id => serial(() => chrome.storage.session.remove(key(id))));
chrome.runtime.onMessage.addListener((message,sender,respond) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return;
  serial(async () => {
    const id = message.tabId;
    if (!Number.isInteger(id) || id < 0) throw new Error('Choose a normal web page first.');
    const state = await read(id);
    switch(message.type) {
      case 'get': return state;
      case 'toggle': {
        const tab = await chrome.tabs.get(id);
        if (!httpURL(tab.url)) throw new Error('Capture works on HTTP and HTTPS pages.');
        state.enabled = Boolean(message.enabled); state.since = Date.now();
        await save(id,state); return state;
      }
      case 'clear': state.streams = []; state.since = Date.now(); await save(id,state); return state;
      default: throw new Error('Unknown action.');
    }
  }).then(data => respond({data}),error => respond({error:error.message}));
  return true;
});
