import {classifyItem} from 'server/classification/orgClassificationSvc';

export function parseClassification(nciXmlCde, cde, orgInfo) {
    if (nciXmlCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM) {
        nciXmlCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(csi => {
            let contextName = csi.ClassificationScheme[0].ContextName[0];
            if (contextName === 'PCORTF CDM') {
                contextName = 'PCORTF CDMH';
            }
            const preferredName = csi.ClassificationScheme[0].PreferredName[0];
            const classificationArray = [contextName, preferredName];
            if (contextName !== 'TEST') {
                classifyItem(cde, orgInfo.classificationOrgName, classificationArray);
            }
        });
    }
}
