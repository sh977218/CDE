const By = require('selenium-webdriver').By;

let catcher = e => {
    console.log('Error checkLformViewer');
    throw e;
};

exports.checkLformViewer = async function (driver, obj, cb) {
    let xpath = 'html/body/div[@class="Section1"]/table[.//th[contains(text(),"PANEL HIERARCHY")]]//a';
    let links = await driver.findElements(By.xpath(xpath)).catch(catcher);
    if (links.length === 0) {
        obj.dependentSection = true;
        cb();
    } else if (links.length === 1) {
        const link = links[0];
        let text = await link.getText().catch(catcher);
        if (text.trim() === 'view this panel in the LForms viewer') {
            obj.dependentSection = false;
            cb();
        }
    } else {
        console.log('Lform viewer link has more xpath found. ' + JSON.stringify(obj));
        process.exit(1);
    }
};