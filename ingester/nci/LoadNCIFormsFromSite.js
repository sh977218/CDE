var fs = require('fs'),
    cheerio = require('cheerio'),
    async = require('async'),
    $ = cheerio.load(fs.readFileSync('./FormBuilder.html'), {}),
    LoadFromNciSite = require('./LoadFromNciSite')
    ;

var counter = 0;
async.forEach($('img[alt="XML Download"]'), function (img, doneOne) {
    var href = 'https://formbuilder.nci.nih.gov' + img.parent.attribs.href;
    LoadFromNciSite.runOne(href, function () {
        console.log('counter: ' + counter++);
        doneOne();
    });
}, function donAll() {
    console.log('finished all. ' + counter);
});
