const async = require('async');
const webdriver = require('selenium-webdriver');
const driver = new webdriver.Builder().forBrowser('chrome').build();
const By = webdriver.By;
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;
const StaticHtmlModel = require('../ingester/createNlmcdeConnection').StaticHtmlModel;

//const prefix_url = 'https://cde.nlm.nih.gov/';
const prefix_url = 'http://localhost:3001/';
let count = 0;

let doHtml = (type, tinyId, cb) => {
    let url = prefix_url + 'deView?tinyId=' + tinyId;
    if (type === 'form') url = prefix_url + 'formView?tinyId=' + tinyId;
    setTimeout(() => {
        driver.get(url).then(() => {
            setTimeout(() => {
                driver.findElement(By.xpath('//html')).then(htmlEle => {
                    setTimeout(() => {
                        htmlEle.getAttribute('innerHTML').then(html => {
                            setTimeout(() => {
                                new StaticHtmlModel({tinyId: tinyId, html: html}).save(err => {
                                    if (err) throw err;
                                    else {
                                        count++;
                                        if (count % 300 === 0) {
                                            console.log('count: ' + count + ' take a timeout.');
                                            setTimeout(cb, 10 * 60 * 1000);
                                        } else {
                                            console.log('count: ' + count);
                                            cb();
                                        }
                                    }
                                });
                            }, 5000);
                        });
                    }, 5000);
                });
            }, 3000);
        });
    }, 5000);
};
async.series([
    cb => {
        DataElementModal.distinct('tinyId', (err, tinyIds) => {
            async.forEach(tinyIds, (tinyId, doneOne) => {
                doHtml('cde', tinyId, doneOne);
            }, cb);
        });
    },
    cb => {
        FormModal.distinct('tinyId', (err, tinyIds) => {
            async.forEach(tinyIds, (tinyId, doneOne) => {
                doHtml('form', tinyId, doneOne);
            }, cb);
        });
    }
]);
