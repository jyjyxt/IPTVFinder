export const MAX_STREAMS = 150;
export function httpURL(value) {
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function classify(url, mime = '') {
  const safe = httpURL(url);
  if (!safe) return null;
  const path = new URL(safe).pathname.toLowerCase();
  const type = mime.split(';')[0].trim().toLowerCase();
  if (/\.(ts|m4s|aac|key)$/.test(path)) return null;
  if (/\.m3u8?$/.test(path) || ['application/vnd.apple.mpegurl', 'application/x-mpegurl', 'audio/mpegurl', 'audio/x-mpegurl'].includes(type)) return 'HLS';
  if (/\.(mp4|webm|mov)$/.test(path) || ['video/mp4','video/webm','video/quicktime'].includes(type)) return 'VIDEO';
  return null;
}
export function mergeStream(items, stream) {
  const existing = items.find(item => item.url === stream.url);
  if (existing) return items.map(item => item === existing ? {...item,lastSeen:stream.lastSeen,status:stream.status} : item);
  return [...items,stream].slice(-MAX_STREAMS);
}
export function streamName(url) {
  try { return decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).at(-1) || 'Live stream'); }
  catch { return 'Live stream'; }
}
export function friendlyError(status = 0) {
  if (status === 401 || status === 403) return 'This stream needs authorization or source-page headers. Open the original page to watch.';
  if (status === 404 || status === 410) return 'This stream is no longer available. Return to the source page and capture it again.';
  return 'Playback failed. The address may have expired, require a specific region, or use an unsupported format. Try the source page or capture it again.';
}
