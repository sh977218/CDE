export async function parseVersion(driver, loincId, element, cb) {
    let text = await element.getText();
    let versionText = text.trim();
    let versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
    let versionNum = versionNumStr.substring(0, versionNumStr.length - 1);
    cb(versionNum);
}