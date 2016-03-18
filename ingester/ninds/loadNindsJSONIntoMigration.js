var fs = require('fs'),
    async = require('async'),
    NindsModel = require('./createConnection').NindsModel
    ;


exports.loadFiles = function (directory, cb) {
    NindsModel.remove({}, function () {
        fs.readdir(directory, function (err, allFileNames) {
            if (err) throw err;
            var fileNames = allFileNames.filter(function (o) {
                return o.indexOf('.json') != -1
            });
            async.forEachSeries(fileNames, function (fileName, doneOneFile) {
                fs.readFile(directory + fileName, 'utf8', function (err, data) {
                    if (err) throw err;
                    var forms = JSON.parse(data);
                    var counter = 0;
                    async.forEachSeries(forms, function (form, doneOne) {
                        if (form.id)
                            form.formId = form.id.replace('NOC-', '').trim();
                        else if (form.downloadLink)
                            form.formId = form.downloadLink.split('CrfId=')[1];
                        else {
                            console.log('no id found');
                            process.exit(0);
                        }
                        var ninds = new NindsModel(form);
                        ninds.save(function () {
                            doneOne();
                            counter++;
                        })
                    }, function () {
                        console.log('finish load file: ' + fileName);
                        doneOneFile();
                    })
                });
            }, function doneAllFiles() {
                console.log('finished all files under ' + directory + ' into db migration collection ninds');
                if (cb)cb();
            })
        });
    });
};

exports.loadFiles('S:/CDE/ninds/3-11-2016/1/', function () {
    process.exit(0);
});