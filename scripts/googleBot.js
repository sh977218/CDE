const async = require('async');
const webdriver = require('selenium-webdriver');
const driver = new webdriver.Builder().forBrowser('chrome').build();
const By = webdriver.By;
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;
const StaticHtmlModel = require('../ingester/createNlmcdeConnection').StaticHtmlModel;

let count = 0;

let doHtml = (type, tinyId, cb) => {
    let url = 'https://cde.nlm.nih.gov/deView?tinyId=' + tinyId;
    if (type === 'form') url = 'https://cde.nlm.nih.gov/formView?tinyId=' + tinyId;
    setTimeout(() => {
        driver.get(url).then(() => {
            driver.findElement(By.xpath('//html')).then(htmlEle => {
                htmlEle.getAttribute('innerHTML').then(html => {
                    new StaticHtmlModel({tinyId: tinyId, html: html}).save(err => {
                        if (err) throw err;
                        else if (count % 5000) setTimeout(cb, 600000);
                        else cb();
                    });
                });
            });
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
], () => {
    console.log('count: ' + count);
    process.exit(1);
});
