const classificationShared = require('esm')(module)('../../../shared/system/classificationShared');

exports.parseClassification = (nciCde, cde, orgInfo) => {
    if (nciCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM) {
        nciCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(csi => {
            let contextName = csi.ClassificationScheme[0].ContextName[0];
            if (contextName === 'PCORTF CDM') contextName = 'PCORI CDM';
            let preferredName = csi.ClassificationScheme[0].PreferredName[0];
            let classificationArray = [contextName, preferredName];
            if (contextName !== 'TEXT') {
                classificationShared.classifyItem(cde, orgInfo.classificationOrgName, classificationArray);
            }
        });
    }
};