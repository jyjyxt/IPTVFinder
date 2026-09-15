import {mkdirSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
mkdirSync('dist',{recursive:true});
rmSync('dist/IPTVFinder.zip',{force:true});
execFileSync('zip',['-qr','../dist/IPTVFinder.zip','.','-x','*.DS_Store'],{cwd:'extension'});
console.log('dist/IPTVFinder.zip — unzip and load the folder in chrome://extensions');
