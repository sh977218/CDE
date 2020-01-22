export async function parseCopyrightText(driver, loincId, element) {
    let copyrightText = await element.getText();
    return copyrightText.trim();
}