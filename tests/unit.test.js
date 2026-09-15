import test from 'node:test';
import assert from 'node:assert/strict';
import {httpURL,classify,mergeStream,MAX_STREAMS,streamName,friendlyError} from '../extension/core.js';
test('recognizes manifests by suffix or MIME including signed and extensionless URLs',() => {
  assert.equal(classify('https://cdn.example/LIVE.M3U8?token=a%2Bb'),'HLS');
  assert.equal(classify('https://cdn.example/channel','Application/Vnd.Apple.Mpegurl; charset=utf-8'),'HLS');
  assert.equal(classify('https://cdn.example/video','video/mp4'),'VIDEO');
  assert.equal(classify('https://cdn.example/clip.webm'),'VIDEO');
});
test('ignores fragments, keys, non-media and non-network addresses',() => {
  for (const suffix of ['ts','m4s','aac','key']) assert.equal(classify(`https://cdn.example/x.${suffix}`,'video/mp2t'),null);
  for (const url of ['javascript:alert(1)','file:///a.m3u8','blob:https://x/a','garbage','https://x/a.json']) assert.equal(classify(url),null);
  assert.equal(httpURL('https://user:password@example.com/live.m3u8'),null);
});
test('deduplicates exact URLs while preserving signed alternatives and stable IDs',() => {
  const a={id:'one',url:'https://x/a.m3u8?token=one',lastSeen:1,status:200};
  const updated=mergeStream([a],{...a,id:'other',lastSeen:2,status:403});
  assert.equal(updated.length,1); assert.equal(updated[0].id,'one'); assert.equal(updated[0].status,403);
  assert.equal(mergeStream(updated,{...a,id:'two',url:'https://x/a.m3u8?token=two'}).length,2);
});
test('limits captures without mutating existing records',() => {
  const original=Array.from({length:MAX_STREAMS},(_,i)=>({id:String(i),url:`https://x/${i}.m3u8`}));
  const next=mergeStream(original,{id:'new',url:'https://x/new.m3u8'});
  assert.equal(next.length,MAX_STREAMS); assert.equal(next[0].id,'1'); assert.equal(original[0].id,'0');
});
test('handles malformed encoded filenames safely',() => {
  assert.equal(streamName('https://x/%E0%A4%A.m3u8'),'Live stream');
  assert.equal(streamName('https://x/channel%20one.m3u8'),'channel one.m3u8');
});
test('explains authorization and expired resource failures',() => {
  assert.match(friendlyError(403),/authorization/); assert.match(friendlyError(404),/no longer/);
});
