let catcher = e => {
    console.log('Error parseVersion');
    throw e;
};

exports.parseVersion = async function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    let text = await element.getText().catch(catcher);
    let versionText = text.trim();
    obj[sectionName][sectionName] = versionText;
    let versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
    let versionNum = versionNumStr.substring(0, versionNumStr.length - 1);
    obj.version = versionNum;
    cb();
};