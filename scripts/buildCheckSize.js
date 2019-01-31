const fs = require('fs');
const path = require('path');

let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), {encoding: 'utf8'}));

if (!Array.isArray(config.bundlesize)) {
    process.exit(0);
}

config.bundlesize.forEach(b => {
    if (b.compression !== 'none') {
        console.log('Error: ' + b.path + ' needs "compression: none"');
        process.exit(1);
    }
    let size = fs.statSync(path.resolve(__dirname, '..', b.path)).size;
    let maxSize = parseFloat(b.maxSize) * (b.maxSize.indexOf(' kB') > -1 ? 1024 : (b.maxSize.indexOf(' MB') > -1 ? 1048576 : 1));
    let minSize = maxSize * 0.99;
    if (size > maxSize) {
        console.log('Error: ' + b.path + ' too big. ' + size + ' > ' + maxSize);
        process.exit(1);
    }
    if (size < minSize) {
        console.log('Error: ' + b.path + ' too small. ' + size + ' < ' + minSize);
        process.exit(1);
    }
});
console.log('PASS');
process.exit(0);
