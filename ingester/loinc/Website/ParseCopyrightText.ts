export async function parseCopyrightText(driver, loincId, element) {
    let text = await element.getText();
    return text.trim();
}