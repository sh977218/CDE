export async function parseVersion(driver, loincId, element) {
    let text = await element.getText();
    let versionText = text.trim();
    let versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
    return versionNumStr.substring(0, versionNumStr.length - 1);
}