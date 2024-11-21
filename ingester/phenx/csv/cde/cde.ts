import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';
import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER,
    compareElt,
    created,
    findOneCde,
    imported,
    lastMigrationScript,
    mergeElt,
    updateCde,
    updateRawArtifact,
} from 'ingester/shared/utility';
import { parseRadxDesignations } from 'ingester/phenx/csv/cde/ParseDesignations';
import { parseDefinitions } from 'ingester/phenx/csv/cde/ParseDefinitions';
import { parseStewardOrg } from 'ingester/phenx/csv/cde/ParseStewardOrg';
import { parseRegistrationState } from 'ingester/phenx/csv/cde/ParseRegistrationState';
import { parseSources } from 'ingester/phenx/csv/cde/ParseSources';
import { parseProperties } from 'ingester/phenx/csv/cde/ParseProperties';
import { parseReferenceDocuments } from 'ingester/phenx/csv/cde/ParseReferenceDocuments';
import { parseRadxIds } from 'ingester/phenx/csv/cde/ParseIds';
import { parseValueDomain } from 'ingester/phenx/csv/cde/ParseValueDomain';
import { parseRadxClassification } from 'ingester/phenx/csv/cde/ParseClassification';
import { dataElementModel } from 'server/cde/mongo-cde';
import { isEmpty } from 'lodash';

export function createPhenXCde(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const designations = parseRadxDesignations(row);
    const definitions = parseDefinitions();
    const stewardOrg = parseStewardOrg(config);
    const registrationState = parseRegistrationState(config);

    const sources = parseSources();

    const ids = parseRadxIds(row);
    const valueDomain = parseValueDomain(row);
    const referenceDocuments = parseReferenceDocuments();
    const properties = parseProperties(row);
    const phenXCde: any = {
        tinyId: generateTinyId(),
        stewardOrg,
        registrationState,
        createdBy: BATCHLOADER,
        created,
        imported,
        sources,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments: [],
        properties,
        ids,
        classification: [],
    };
    parseRadxClassification(phenXCde, row, config);

    return phenXCde;
}

export async function doOnePhenXCde(row: any, config = DEFAULT_RADX_UP_CONFIG) {
    const phenXCde = await createPhenXCde(row, config);
    const newCde = new dataElementModel(phenXCde);
    const newCdeObj = newCde.toObject();
    const cond = {
        'registrationState.registrationStatus': { $ne: 'Retired' },
        archived: false,
        'ids.id': row['Variable / Field Name'],
        loadAsNewCde: true,
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    let existingCde: any = findOneCde(existingCdes);
    if (!existingCde) {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save cde when save new ${config.source} cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), config.source);
        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            existingCde = await existingCde.save().catch((err: any) => {
                console.log(
                    `Not able to save cde when save existing ${config.source} cde ${existingCde.tinyId} ${err}`
                );
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, config.source);
            await updateCde(existingCdeObj, BATCHLOADER, { updateSource: true }).catch((err: any) => {
                console.log(
                    `Not able to update cde when update existing ${config.source} cde ${existingCde.tinyId} ${err}`
                );
                process.exit(1);
            });
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    await updateRawArtifact(existingCde, newCdeObj, config.source, config.classificationOrgName);

    //    const savedCde: any = await dataElementModel.findOne(cond);
    const savedCde: any = await dataElementModel.findOne({
        'registrationState.registrationStatus': { $ne: 'Retired' },
        archived: false,
        'ids.id': row['Variable / Field Name'],
    });
    return savedCde;
}
