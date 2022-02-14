module.exports = function (content, map, meta) {
    const matches = content.matchAll(/<a\s([^>"]*("[^"]*")?)*[^>]*/g);
    for (let match of matches) {
        if ((match + '').indexOf('href') === -1) {
            this.emitError(new Error('Invalid <a> without href: ' + match + '>'));
        }
    }
    return content;
};
