import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

let config = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), {encoding: 'utf8'}));

if (!Array.isArray(config.bundlesize)) {
    process.exit(0);
}

config.bundlesize.forEach(b => {
    if (b.compression !== 'none') {
        console.error('Error: ' + b.path + ' needs "compression: none"');
        process.exit(1);
    }
    let actualSize = statSync(resolve(__dirname, '..', b.path)).size;
    let isKb = b.maxSize.indexOf('kB') > -1;
    let isMb = b.maxSize.indexOf('MB') > -1;
    let ratio = 1;
    if (isKb) ratio = 1024;
    if (isMb) ratio = 1048576;
    let maxSize = parseFloat(b.maxSize) * ratio;
    let minSize = maxSize * 0.99;
    if (actualSize > maxSize) {
        console.error('Error: ' + b.path + ' too big. actualSize: ' + actualSize + ' > maxSize: ' + maxSize);
        process.exit(1);
    }
    if (actualSize < minSize) {
        console.error('Error: ' + b.path + ' too small. actualSize: ' + actualSize + ' < minSize: ' + minSize);
        process.exit(1);
    }
});
console.log('Build Check Size PASSED');
process.exit(0);