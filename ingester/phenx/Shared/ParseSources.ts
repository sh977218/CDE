import { isEmpty } from 'lodash';

export function parseSources(protocol) {
    let sources = [];
    let releaseDate = protocol.releaseDate;
    let source = {
        sourceName: 'PhenX',
        copyright: {
            valueFormat: "html",
            value: "<a href='http://www.phenxtoolkit.org' target='_blank'>Terms of Use</a>"
        }
    };
    if (!isEmpty(releaseDate)) {
        source['updated'] = releaseDate.trim();
    }
    sources.push(source);
    return sources;
}

