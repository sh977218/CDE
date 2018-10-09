const By = require('selenium-webdriver').By;

const ParseFullySpecifiedName = require('./ParseFullySpecifiedName');
const ParseLongCommonName = require('./ParseLongCommonName');
const ParseShortname = require('./ParseShortname');

exports.parseNameTable = async function (driver, loincId, table, cb) {
    let result = {};
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();

    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        let td2Text = await tds[1].getText();
        if (td2Text.trim() === 'Fully-Specified Name:') {
            // Parse Fully-Specified Name
            let fullSpecifiedName = await ParseFullySpecifiedName.parseFullySpecifiedName(tr);
            result['Fully-Specified Name'] = fullSpecifiedName;
        }
        if (td2Text.trim() === 'Long Common Name:') {
            // Parse Long Common Name
            let longCommonName = await ParseLongCommonName.parseLongCommonName(tr);
            result['Long Common Name'] = longCommonName;
        }
        if (td2Text.trim() === 'Shortname:') {
            // Parse Shortname
            result['Shortname'] = await ParseShortname.parseShortname(tr);
        }
    }

    cb(result);
};