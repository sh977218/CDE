import { getCell } from 'shared/loader/utilities/utility';
import { validateURL } from 'server/loader/validators';


export function parseReferenceDocuments(row: any){
    const reference = getCell(row, 'References (only for standardized bundles/instruments)');
    const refArray = [];
    const validURL = validateURL(reference);
    if(reference){
        refArray.push({
            uri: validURL ? reference : null,
            text: reference,
            docType: 'text',
            languageCode: 'en-us',
            document: validURL ? null : reference
        });
    }

    return refArray;
}