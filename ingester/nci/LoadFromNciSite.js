var request = require('request'),
    url = require('url'),
    async = require('async'),
    parseString = require('xml2js').parseString,
    MigrationNCIModel = require('../createMigrationConnection').MigrationNCIFormXmlModel
    ;
var jSessionId = '';

exports.setJSessionId = function (id) {
    jSessionId = id;
};

function doNCI(href, cb) {
    if (jSessionId.length === 0) {
        cb('no jSessionId set');
        return;
    }
    var parsedUrl = url.parse(href, true, true);
    var options = {
        method: 'GET',
        rejectUnauthorized: false,
        url: 'https://formbuilder.nci.nih.gov/FormBuilder/formXMLDownload.do',
        qs: {'': '', formIdSeq: parsedUrl.query.formIdSeq},
        headers: {
            'Cookie': 'JSESSIONID=' + jSessionId
        }
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        parseString(body, function (err, result) {
            result.form.href = href;
            var obj = MigrationNCIModel(result);
            obj.save(function () {
                cb();
            })
        });
    });
}

exports.runOne = function (nciUrl, removeMigration, next) {
    async.series([
        function (cb) {
            if (removeMigration) {
                MigrationNCIModel.remove({}, function (err) {
                    if (err) throw err;
                    console.log('removed migration nci collection.');
                    cb();
                });
            } else cb();
        },
        function (cb) {
            doNCI(nciUrl, cb);
        },
        function () {
            if (next) next();
            else process.exit(1);
        }
    ]);
};

exports.runArray = function (nciUrlArray, next) {
    async.series([
        function (cb) {
            MigrationNCIModel.remove({}, function (err) {
                if (err) throw err;
                console.log('removed migration nci collection.');
                cb();
            });
        },
        function (cb) {
            async.forEach(nciUrlArray, function (nciUrl, doneOne) {
                doNCI(nciUrl, doneOne);
            }, function doneAll() {
                cb();
            })
        },
        function () {
            if (next) next();
            else process.exit(1);
        }
    ]);

};