const fs = require('fs');
const cheerio = require('cheerio');
const async = require('async');
const $ = cheerio.load(fs.readFileSync('./FormBuilder.html'), {});
const LoadFromNciSite = require('./LoadFromNciSite');

/*
 set this id before run script.
 1. go to https://formbuilder.nci.nih.gov/FormBuilder/formSearchAction.do
 2. open development model, Application -> Cookies;
 3. copy JSession id.
 */
let jSessionId = 'PLxTcUPHpdtwsovnSC-Z6oWY.nciws-p786-v';

let counter = 0;
let hrefArray = [];
$('img[alt="XML Download"]').each(function (i, img) {
    let href = 'https://formbuilder.nci.nih.gov' + img.parent.attribs.href;
    hrefArray.push(href);
});
// very important!!!
LoadFromNciSite.setJSessionId(jSessionId);

async.forEach(hrefArray, function (href, doneOne) {
    LoadFromNciSite.runArray([href], false, function () {
        console.log('counter: ' + counter++);
        doneOne();
    });
}, function donAll() {
    console.log('finished all. ' + counter);
    process.exit(1);
});