import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

const workindDirectory = process.cwd();
const config = JSON.parse(readFileSync(resolve(workindDirectory, 'package.json'), {encoding: 'utf8'}));

if (!config) {
    console.log('Build Check Size FAILED.');
    console.log('package.json not found');
    console.log(workindDirectory);
    process.exit(1);
}
if (!Array.isArray(config.bundlesize)) {
    console.log('Build Check Size NOT USED.');
    console.log(workindDirectory);
    process.exit(1);
}

const errors: string[] = [];

config.bundlesize.forEach((b: {compression: string, maxSize: string, path: string}) => {
    if (b.compression !== 'none') {
        console.error('Error: ' + b.path + ' needs "compression: none"');
        process.exit(1);
    }
    const actualSize = statSync(resolve(workindDirectory, b.path)).size;
    const isKb = b.maxSize.indexOf('kB') > -1;
    const isMb = b.maxSize.indexOf('MB') > -1;
    let ratio = 1;
    if (isKb) {
        ratio = 1024;
    }
    if (isMb) {
        ratio = 1048576;
    }
    const maxSize = parseFloat(b.maxSize) * ratio;
    const minSize = maxSize * 0.9;
    if (actualSize > maxSize) {
        errors.push('Error: ' + b.path + ' too big. actualSize: ' + actualSize + ' > maxSize: ' + maxSize);
    }
    if (actualSize < minSize) {
        errors.push('Error: ' + b.path + ' too small. actualSize: ' + actualSize + ' < minSize: ' + minSize);
    }
});
if (errors.length) {
    console.log('Build Check Size FAILED.');
    console.error(errors);
    process.exit(1);
} else {
    console.log('Build Check Size PASSED.');
    process.exit(0);
}
