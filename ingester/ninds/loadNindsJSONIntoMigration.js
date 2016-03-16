var fs = require('fs'),
    async = require('async'),
    NindsModel = require('./createConnection').NindsModel
    ;


exports.loadFiles = function (directory, cb) {
    fs.readdir(directory, function (err, allFileNames) {
        if (err) throw err;
        var fileNames = allFileNames.filter(function (o) {
            return o.indexOf('.json') != -1
        });
        async.forEachSeries(fileNames, function (fileName, doneOneFile) {
            fs.readFile(directory + fileName, 'utf8', function (err, data) {
                if (err) throw err;
                var forms = JSON.parse(data);
                async.forEachSeries(forms, function (form, doneOne) {
                    var ninds = new NindsModel(form);
                    ninds.save(function () {
                        doneOne();
                    })
                }, function () {
                    console.log('finish load file: ' + fileName);
                    doneOneFile();
                })
            });
        }, function doneAllFiles() {
            console.log('finished all files under ' + directory + ' into db migration collection ninds');
            cb();
        })
    });
};