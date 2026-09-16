import {copyFileSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('extension/vendor',{recursive:true});
// Keep the full Apache license alongside upstream's shorter copyright notice.
const apache = readFileSync('extension/vendor/APACHE-2.0.txt','utf8');
if (!apache.includes('TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION')) {
  throw new Error('Missing full Apache 2.0 license.');
}
copyFileSync('node_modules/hls.js/dist/hls.min.js','extension/vendor/hls.min.js');
copyFileSync('node_modules/hls.js/LICENSE','extension/vendor/HLS-LICENSE.txt');
const sources = ['src/utils/cea-608-parser.ts','src/utils/vttcue.ts','src/utils/utf8-utils.ts'];
const notices = sources.map(path => {
  const source = readFileSync(`node_modules/hls.js/${path}`,'utf8');
  const notice = source.match(/\/\*[\s\S]*?\*\//g)?.find(comment=>/copyright/i.test(comment));
  if (!notice) throw new Error(`Missing upstream copyright notice in ${path}; review updated hls.js licensing.`);
  return `${path}\n${notice}`;
});
writeFileSync('extension/vendor/THIRD-PARTY-NOTICES.txt',
  `Additional notices from bundled hls.js source components.\nSee HLS-LICENSE.txt and APACHE-2.0.txt for the main library license.\n\n${notices.join('\n\n')}\n`);
console.log('Vendored pinned hls.js, license and component notices.');
