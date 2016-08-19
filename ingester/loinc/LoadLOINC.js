var request = require('request');
var async = require('async');
exports.runArray = function (loincArray, doneOne, doneAll) {
    var results = [];
    var options = {
        method: 'GET',
        url: 'https://forms.loinc.org/panel/def',
        qs: {p_num: ''},
        headers: {
            'postman-token': '06c6fe3c-20c8-56dd-db0f-58b05d398418',
            'cache-control': 'no-cache',
            'authorization': 'Basic bHVkZXRjOmxvdmVsb2luYw==',
            'cookie': '_ga=GA1.2.1485451098.1471630504; _gat=1'
        }
    };
    async.forEachSeries(loincArray, function (loinc, doneOneLoinc) {
        options.qs.p_num = loinc;
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            var lform = JSON.parse(body);
            results.push(lform);
            doneOne(lform, doneOneLoinc);
        });
    }, function doneAllLoincs() {
        doneAll(results);
    })
};
