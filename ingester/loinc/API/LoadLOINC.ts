const request = require('request');
import { forEachSeries } from 'async';

exports.runArray = (loincArray, doneOne, doneAll) => {
    const results = [];
    const options: any = {
        method: 'GET',
        url: 'https://forms.loinc.org/panel/def',
        qs: {p_num: ''},
        headers: {
            'postman-token': '06c6fe3c-20c8-56dd-db0f-58b05d398418',
            'cache-control': 'no-cache',
            authorization: 'Basic bHVkZXRjOmxvdmVsb2luYw==',
            cookie: '_ga=GA1.2.1485451098.1471630504; _gat=1'
        }
    };
    forEachSeries(loincArray, (loinc, doneOneLoinc) => {
        options.qs.p_num = loinc;
        request(options, (error, response, body) => {
            if (error) {
                throw new Error(error);
            }
            const lform = JSON.parse(body);
            results.push(lform);
            doneOne(lform, doneOneLoinc);
        });
    }, function doneAllLoincs() {
        doneAll(results);
    });
};
