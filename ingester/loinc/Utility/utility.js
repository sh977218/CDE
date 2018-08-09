exports.sanitizeText = function (string) {
    return string.replace(/:/g, '').replace(/\./g, '').trim();
};