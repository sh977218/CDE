import { addNichdDesignation } from 'ingester/nichd/csv/cde/ParseDesignations';
import { classifyItem } from 'server/classification/orgClassificationSvc';
import { NichdConfig } from 'ingester/nichd/shared/utility';
import { imported, lastMigrationScript } from 'ingester/shared/utility';
import { addNichdIdentifier } from 'ingester/nichd/csv/cde/ParseIds';

export function addNichdMetaInfo(elt: any, row: any, config: NichdConfig) {
    let eltObj = elt;
    if (elt.toObject) {
        eltObj = elt.toObject();
    }
    addNichdDesignation(elt, row);
    addNichdIdentifier(elt, row, config);
//    classifyItem(eltObj, config.classificationOrgName, config.classificationArray.concat(row['Form Name']));
    classifyItem(eltObj, config.classificationOrgName, config.classificationArray);
    elt.classification = eltObj.classification;
    elt.lastMigrationScript = lastMigrationScript;
    elt.changeNote = lastMigrationScript;
    elt.imported = imported;
    elt.updatedDate = imported;
}
