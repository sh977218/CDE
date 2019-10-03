export async function parseVersion(driver, loincId, element) {
    const versionText = await element.getText();
    const versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
    const versionNum = versionNumStr.substring(0, versionNumStr.length - 1);
    return versionNum;
}
