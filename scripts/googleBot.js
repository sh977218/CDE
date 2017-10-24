const async = require('async');
const webdriver = require('selenium-webdriver');
const driver = new webdriver.Builder().forBrowser('chrome').build();
const By = webdriver.By;
const mongo_cde = require('../modules/cde/node-js/mongo-cde');
const DataElementModal = mongo_cde.DataElement;
const mongo_form = require('../modules/form/node-js/mongo-form');
const FormModal = mongo_form.Form;
const StaticHtmlModel = require('../ingester/createNlmcdeConnection').StaticHtmlModel;

let doHtml = (type, tinyId, cb) => {
    let url = 'https://cde.nlm.nih.gov/deView?tinyId=' + tinyId;
    if (type === 'form') url = 'https://cde.nlm.nih.gov/formView?tinyId=' + tinyId;
    driver.get(url).then(() => {
        setTimeout(() => {
            driver.findElement(By.xpath('//html')).then(htmlEle => {
                htmlEle.getAttribute('innerHTML').then(html => {
                    new StaticHtmlModel({tinyId: tinyId, html: html}).save(err => {
                        if (err) throw err;
                    });
                });
            });
        }, 5000);
    });
};

DataElementModal.distinct('tinyId', (err, tinyIds) => {
    tinyIds.forEach(tinyId => {
        doHtml('cde', tinyId);
    });
});

FormModal.distinct('tinyId', (err, tinyIds) => {
    tinyIds.forEach(tinyId => {
        doHtml('form', tinyId);
    });
});
