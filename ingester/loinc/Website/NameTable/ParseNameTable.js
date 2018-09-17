const By = require('selenium-webdriver').By;

const ParseFullySpecifiedName = require('./ParseFullySpecifiedName');
const ParseLongCommonName = require('./ParseLongCommonName');
const ParseShortname = require('./ParseShortname');

exports.parseNameTable = async function (driver, loincId, table, cb) {
    let result = {};
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();

    // Parse Fully-Specified Name
    let fullSpecifiedName = await ParseFullySpecifiedName.parseFullySpecifiedName(trs[0]);
    result['Fully-Specified Name'] = fullSpecifiedName;


    // Parse Long Common Name
    let longCommonName = await ParseLongCommonName.parseLongCommonName(trs[1]);
    result['Long Common Name'] = longCommonName;

    // Parse Shortname
    if (trs[2]) {
        result['Shortname'] = await ParseShortname.parseShortname(trs[2]);
    }

    cb(result);
};