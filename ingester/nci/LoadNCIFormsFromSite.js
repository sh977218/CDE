var fs = require('fs'),
    cheerio = require('cheerio'),
    $ = cheerio.load(fs.readFileSync('./FormBuilder.html'), {})
    ;


$('table').each(function (i, t) {
    console.log(t.html());
});


