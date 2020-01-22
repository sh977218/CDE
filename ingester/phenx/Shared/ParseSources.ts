import { isEmpty } from 'lodash';
import { imported } from 'ingester/shared/utility';

export function parseSources(protocol) {
    const sources: any[] = [];
    const releaseDate = protocol.releaseDate;
    const source: any = {
        imported,
        sourceName: 'PhenX',
        copyright: {
            valueFormat: 'html',
            value: "<a href='http://www.phenxtoolkit.org' target='_blank'>Terms of Use</a>"
        }
    };
    if (!isEmpty(releaseDate)) {
        source.updated = releaseDate.trim();
    }
    sources.push(source);
    return sources;
}

