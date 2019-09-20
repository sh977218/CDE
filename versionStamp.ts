const { gitDescribeSync } = require('git-describe');
const fs = require('fs');
const cheerio = require('cheerio');


const gitInfo = gitDescribeSync({
    dirtyMark: false,
    dirtySemver: false
});

const appIndex = cheerio.load( fs.readFileSync('modules/system/views/index.ejs'));

appIndex('meta[site-version]')

console.log(appIndex.replace('<%= version %>', gitInfo.hash));


