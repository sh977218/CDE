import { uniq } from 'lodash';
import { sortReferenceDocuments } from 'ingester/shared/utility';

export function parseReferenceDocuments(nindsForms: any[]) {
    const downloadLinkArray: string[] = [];
    nindsForms.forEach(nindsForm => {
        if (nindsForm.downloadLink) {
            downloadLinkArray.push(nindsForm.downloadLink);
        }
    });
    const downloadLink = uniq(downloadLinkArray);
    const referenceDocuments: any[] = [];

    downloadLink.forEach(d => {
        referenceDocuments.push({
            uri: d.trim(),
            source: 'NINDS'
        });
    });
    return sortReferenceDocuments(referenceDocuments);
}
