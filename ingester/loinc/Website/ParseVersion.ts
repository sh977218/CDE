export async function parseVersion(driver, loincId, element) {
    let versionText = await element.getText();
    let versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
    let versionNum = versionNumStr.substring(0, versionNumStr.length - 1);
    return versionNum;
}