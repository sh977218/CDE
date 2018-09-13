exports.parseCopyrightText = async function (element, cb) {
    let text = await element.getText();
    let copyright = text.trim();
    cb(copyright);
};