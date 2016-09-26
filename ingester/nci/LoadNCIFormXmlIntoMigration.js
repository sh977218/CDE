var fs = require('fs'),
    cheerio = require('cheerio'),
    async = require('async'),
    $ = cheerio.load(fs.readFileSync('./FormBuilder.html'), {}),
    LoadFromNciSite = require('./LoadFromNciSite')
    ;

/*
 set this id before run script.
 1. go to https://formbuilder.nci.nih.gov/FormBuilder/formSearchAction.do
 2. open development model, check cookie.
 3. copy JSession id.
 */
var jSessionId = '6BC9CE4B0157FA5CB9AD4C68581DA5FF';

var counter = 0;
var hrefArray = [];
$('img[alt="XML Download"]').each(function (i, img) {
    var href = 'https://formbuilder.nci.nih.gov' + img.parent.attribs.href;
    hrefArray.push(href);
});
// very important!!!
LoadFromNciSite.setJSessionId(jSessionId);

async.forEach(hrefArray, function (href, doneOne) {
    LoadFromNciSite.runOne(href, false, function () {
        console.log('counter: ' + counter++);
        doneOne();
    });
}, function donAll() {
    console.log('finished all. ' + counter);
    process.exit(1);
});