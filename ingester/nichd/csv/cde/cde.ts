import {generateTinyId} from 'server/system/mongo-data';
import {
    BATCHLOADER,
    compareElt,
    created,
    findOneCde,
    imported,
    lastMigrationScript,
    mergeElt,
    updateCde
} from 'ingester/shared/utility';
import {parseNichdDesignations} from 'ingester/nichd/csv/cde/ParseDesignations';
import {parseNichdDefinitions} from 'ingester/nichd/csv/cde/ParseDefinitions';
import {parseSources} from 'ingester/nichd/csv/cde/ParseSources';
import {parseNichdIds} from 'ingester/nichd/csv/cde/ParseIds';
import {parseNichdValueDomain} from 'ingester/nichd/csv/cde/ParseValueDomain';
import {parseNichdReferenceDocuments} from 'ingester/nichd/csv/cde/ParseReferenceDocuments';
import {parseNichdProperties} from 'ingester/nichd/csv/cde/ParseProperties';
import {NichdConfig} from 'ingester/nichd/shared/utility';
import {parseStewardOrg} from 'ingester/nichd/csv/cde/ParseStewardOrg';
import {dataElementModel} from 'server/cde/mongo-cde';
import {addNichdMetaInfo} from 'ingester/nichd/csv/shared/utility';
import {isEmpty, trim} from 'lodash';
import {runOneCde} from 'ingester/loinc/LOADER/loincCdeLoader';
import {classifyItem} from 'server/classification/orgClassificationSvc';

let existingCdeCount = 0;
let newCdeCount = 0;

export function createNichdCde(nichdRow: any, config: NichdConfig) {
    const designations = parseNichdDesignations(nichdRow, config);
    const definitions = parseNichdDefinitions();
    const sources = parseSources(config);

    const ids = parseNichdIds(nichdRow, config);
    const valueDomain = parseNichdValueDomain(nichdRow);
    const referenceDocuments = parseNichdReferenceDocuments();
    const properties = parseNichdProperties();
    const stewardOrg = parseStewardOrg(config);
    const nichdCde: any = {
        tinyId: generateTinyId(),
        stewardOrg,
        registrationState: {registrationStatus: config.registrationStatus},
        createdBy: BATCHLOADER,
        lastMigrationScript,
        changeNote: lastMigrationScript,
        created,
        imported,
        sources,
        source: config.source,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments: [],
        properties,
        ids,
        classification: []
    };
//    classifyItem(nichdCde, config.classificationOrgName, config.classificationArray.concat(nichdRow['Form Name']));
    classifyItem(nichdCde, config.classificationOrgName, config.classificationArray);
    return nichdCde;
}

export async function loadNichdRowWithNlm(nichdRow: any, config: NichdConfig) {
    const nlmId = trim(nichdRow['NLM ID']);
    // There is already existing CDE mapped by tiny id. classify CDE under NICHD.
    const cond = {
        archived: false,
        tinyId: nlmId,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    const existingCde = findOneCde(existingCdes);
    if (isEmpty(existingCde)) {
        console.log(`Zero CDE found by tinyId: ${nlmId}`);
        process.exit(1);
    } else {
        const existingCdeObj = existingCde.toObject();
        addNichdMetaInfo(existingCdeObj, nichdRow, config)
        existingCdeCount++;
        console.log(`existingCde: ${existingCdeObj.tinyId}`)
        const savedCde = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
            console.log(`LOINC existingCde = await newCde.save() error: ${JSON.stringify(err)}`);
            process.exit(1);
        });
        return savedCde;
    }
}

export async function loadNichdRowWithLoinc(nichdRow: any, config: NichdConfig) {
    const loincId = trim(nichdRow.LOINC);
    // There is LOINC CDE mapped. classify CDE under NICHD.
    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        ids: {
            $elemMatch: {
                source: 'LOINC',
                id: loincId
            }
        }
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    if (existingCdes.length === 0) {
        const existingLoinc = await LoincModel.findOne({'LOINC Code': loincId}).lean();
        const existingCde = await runOneCde(existingLoinc, config);
        const existingCdeObj = existingCde.toObject();
        addNichdMetaInfo(existingCde, nichdRow, config);
        console.log(`newCde: ${existingCdeObj.tinyId}`)
        const savedCde = await existingCde.save();
        return savedCde;
    } else if (existingCdes.length === 1) {
        const existingCde = existingCdes[0];
        const existingCdeObj = existingCde.toObject();
        addNichdMetaInfo(existingCdeObj, nichdRow, config);
        existingCdeCount++;
        console.log(`existingCde: ${existingCdeObj.tinyId}`)
        const savedCde = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
            console.log(`${config.source} await updateCde(existingCdeObj error: ${JSON.stringify(err)}`);
            process.exit(1);
        });
        return savedCde;
    } else {
        console.log(`Multiple CDE found by loinc id: ${loincId}`);
        process.exit(1);
    }
}

export async function loadNichdRow(nichdRow: any, config: NichdConfig) {
    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        ids: {
            $elemMatch: {
                source: config.idSource,
                id: trim(nichdRow['Variable / Field Name'])
            }
        }
    };
    const existingCdes = await dataElementModel.find(cond);
    let existingCde = findOneCde(existingCdes);
    const newCdeObj = createNichdCde(nichdRow, config);
    const newCde = new dataElementModel(newCdeObj);
    if (isEmpty(existingCde)) {
        console.log(`newCde: ${newCdeObj.tinyId}`)
        existingCde = await newCde.save().catch((err: any) => {
            console.log(nichdRow);
            console.log(newCdeObj);
            console.log(newCde);
            console.log(`${config.source} await newCde.save() error: ${err}`);
            process.exit(1);
        });
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), config.source);
        addNichdMetaInfo(existingCde, nichdRow, config);
        existingCdeCount++;
        console.log(`existingCde: ${existingCde.tinyId}`)
        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            await existingCde.save().catch((err: any) => {
                console.log(existingCde);
                console.log(`${config.source} await existingCde.save() error: ${err}`);
                process.exit(1);
            });
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, config.source);
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
                console.log(`${config.source} await updateCde(existingCdeObj error: ${JSON.stringify(err)}`);
                process.exit(1);
            });
        }
    }
    const savedCde: any = await dataElementModel.findOne(cond);
    return savedCde;
}
