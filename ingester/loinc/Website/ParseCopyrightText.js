exports.parseCopyrightText = async function (driver, loincId, element, cb) {
    let text = await element.getText();
    let copyright = text.trim();
    cb(copyright);
};