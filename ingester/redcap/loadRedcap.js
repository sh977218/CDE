var parser = require('csv-parser');
var fs = require('fs');
var async = require('async');

var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/a';
var zipCount = 0;

var query = {archived: null, 'properties.key': 'PhenX Variables', 'properties.value': {$regex: /PX010101/}};


function doCSV(filePath, cb) {
    var stream = fs.createReadStream(filePath).pipe(parser());
    stream.on('headers', function (data) {
        if (data !== "")
            console.log('header is not same');
    });
    stream.on('data', function (data) {
        console.log('');
    });
    stream.on('err', function (err) {
        if (err) throw err;
    });
    stream.on('close', function () {
        cb();
    });
}
function doZip(filePath, cb) {
    fs.readdir(filePath, (err, items)=> {
        if (err) throw err;
        else {
            var fileCount = 0;
            async.forEach(items, (item, doneOneItem)=> {
                if (item === 'instrument.csv') {
                    doCSV(filePath + '/instrument.csv', function () {
                        console.log('done instrument');
                        doneOneItem();
                    });
                }
            }, ()=> {
                console.log('finished ' + filePath + ' fileCount: ' + fileCount);
                cb();
            })
        }
    })
}

fs.readdir(ZIP_PATH, (err, items) => {
    if (err) throw err;
    else {
        async.forEachSeries(items, (item, doneOneItem)=> {
            if (item.indexOf('.zip') !== -1) {
                doZip(ZIP_PATH + '/' + item, function () {
                    zipCount++;
                    console.log('zipCount: ' + zipCount);
                    doneOneItem();
                });
            } else {
                console.log('do not know what to do with ' + item);
                doneOneItem();
            }
        }, ()=> {
            console.log('finished all.');
        });
    }
});
