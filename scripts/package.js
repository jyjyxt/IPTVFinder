import {mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
mkdirSync('dist',{recursive:true});
rmSync('dist/PublicIPTV.zip',{force:true});
execFileSync('zip',['-qr','../dist/PublicIPTV.zip','.','-x','*.DS_Store'],{cwd:'extension'});
console.log('dist/PublicIPTV.zip — unzip and load the folder in chrome://extensions');
