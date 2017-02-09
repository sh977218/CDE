var unzip = require('unzip');
var fs = require('fs');
var async = require('async');

var ZIP_PATH = 'q:/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip';
var zipCount = 0;
function doZip(filePath, cb) {
    var fileCount = 0;
    fs.createReadStream(filePath).pipe(unzip.Parse()).on('entry', function (entry) {
        fileCount++;
        console.log('fileCount: ' + fileCount);
        var fileName = entry.path;
        var type = entry.type; // 'Directory' or 'File'
        var size = entry.size;
        if (fileName === "instrument.csv") {
            entry.pipe(fs.createWriteStream('output/path'));
        } else {
            entry.autodrain();
        }
    });
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
