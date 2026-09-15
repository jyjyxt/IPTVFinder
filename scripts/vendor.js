import {copyFileSync,mkdirSync} from 'node:fs';
mkdirSync('extension/vendor',{recursive:true});
copyFileSync('node_modules/hls.js/dist/hls.min.js','extension/vendor/hls.min.js');
copyFileSync('node_modules/hls.js/LICENSE','extension/vendor/HLS-LICENSE.txt');
console.log('Vendored pinned hls.js and its license.');
