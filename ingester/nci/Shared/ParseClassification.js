const classificationMapping = require('../classificationMapping/caDSRClassificationMapping.json');

function getStringVersion(shortVersion) {
    if (shortVersion.indexOf(".") === -1)
        return shortVersion + ".0";
    return shortVersion;
};

exports.parseClassification = (nciCde, orgInfo) => {
    let classification = [];
    if (nciCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM) {
        nciCde.CLASSIFICATIONSLIST[0].CLASSIFICATIONSLIST_ITEM.forEach(csi => {
            let contextName = csi.ClassificationScheme[0].ContextName[0];
            let preferredName = csi.ClassificationScheme[0].PreferredName[0];
            classification.push({
                stewardOrg: {
                    name: orgInfo.classificationOrgName
                },
                elements: [{
                    name: contextName,
                    elements: [{
                        name: preferredName,
                        elements: []
                    }]
                }]
            })
        });
    }

    return classification;
};