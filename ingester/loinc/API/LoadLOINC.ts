import { forEachSeries } from 'async';
import fetch, { RequestInit } from 'node-fetch';
import { isStatus, json } from 'shared/fetch';

exports.runArray = (loincArray: string[], doneOne: any, doneAll: any) => {
    const results: any[] = [];
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'postman-token': '06c6fe3c-20c8-56dd-db0f-58b05d398418',
            'cache-control': 'no-cache',
            authorization: 'Basic bHVkZXRjOmxvdmVsb2luYw==',
            cookie: '_ga=GA1.2.1485451098.1471630504; _gat=1'
        }
    };
    forEachSeries(loincArray, (loinc, doneOneLoinc) => {
        fetch('https://forms.loinc.org/panel/def?p_num=' + loinc, options)
            .then(isStatus([200]))
            .then(json)
            .then(lform => {
                results.push(lform);
                doneOne(lform, doneOneLoinc);
            });
    }, function doneAllLoincs() {
        doneAll(results);
    });
};
