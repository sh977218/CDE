export function parseSources(protocol) {
    let sources = [];
    let releaseDate = protocol['Protocol Release Date'];
    if (releaseDate)
        sources.push({
            sourceName: 'PhenX',
            updated: releaseDate.trim(),
            copyright: {
                valueFormat: "html",
                value: "<a href='http://www.phenxtoolkit.org' target='_blank'>Terms of Use</a>"
            }
        });
    return sources;
}
