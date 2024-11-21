import {isEmpty, trim} from 'lodash';
import {dataElementModel, dataElementSourceModel} from 'server/cde/mongo-cde';
import {formModel, formSourceModel} from 'server/form/mongo-form';
import {
    BATCHLOADER,
    findOneCde,
    imported,
    lastMigrationScript,
    mergeClassificationByOrg,
    updateCde,
    updateRawArtifact
} from 'ingester/shared/utility';
import {createNichdCde} from 'ingester/nichd/csv/cde/cde';
import {addNichdIdentifier} from 'ingester/nichd/csv/cde/ParseIds';
import {addNichdDesignation} from 'ingester/nichd/csv/cde/ParseDesignations';
import {addNichdSource} from 'ingester/nichd/csv/cde/ParseSources';
import {DEFAULT_NICHD_CONFIG, NichdConfig} from 'ingester/nichd/shared/utility';
import {createNichdForm} from 'ingester/nichd/csv/form/form';

const XLSX = require('xlsx');

let updatedDeCount = 0;
let newDeCount = 0;
let sameDeCount = 0;

let newFormCount = 0;

export async function runOneNichdDataElement(nichdRow: any, config: NichdConfig) {
    const nlmId = trim(nichdRow.shortID);
    const newCdeObj = createNichdCde(nichdRow, config);
    const newCde = new dataElementModel(newCdeObj);
    let existingCde: any;
    if (isEmpty(nlmId) || nlmId === '?') {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save new NICHD cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        newDeCount++;
        console.log(`newDeCount: ${newDeCount} newDe ${existingCde.tinyId}`);
        await new dataElementSourceModel(newCdeObj).save();
        return existingCde;
    } else {
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingCdes: any[] = await dataElementModel.find(cond);
        existingCde = findOneCde(existingCdes);
        const existingCdeObj = existingCde.toObject();
        addNichdDesignation(existingCdeObj, nichdRow);
        addNichdSource(existingCdeObj, config);
        addNichdIdentifier(existingCdeObj, nichdRow, config);
        mergeClassificationByOrg(existingCdeObj, newCde.toObject(), 'NICHD');
        existingCdeObj.imported = imported;
        existingCdeObj.changeNote = lastMigrationScript;
        if (existingCdeObj.lastMigrationScript === lastMigrationScript) {
            existingCde.designations = existingCdeObj.designations;
            existingCde.ids = existingCdeObj.ids;
            existingCde.sources = existingCdeObj.sources;
            existingCde.classification = existingCdeObj.classification;
            const sameCdeSaved: any = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save same NICHD cde ${newCde.tinyId} ${err}`);
                process.exit(1);
            });
            sameDeCount++;
            console.log(`sameDeCount: ${sameDeCount} sameCdeSaved ${sameCdeSaved.tinyId}`);
            await updateRawArtifact(existingCdeObj, newCde.toObject(), config.source, 'NICHD');
            return sameCdeSaved;
        } else {
            existingCdeObj.lastMigrationScript = lastMigrationScript;
            const updatedCdeSaved: any = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                console.log(`Not able to update existing NICHD cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            updatedDeCount++;
            console.log(`updatedDeCount: ${updatedDeCount} updateCdeSaved ${updatedCdeSaved.tinyId}`);
            await updateRawArtifact(existingCdeObj, newCde.toObject(), config.source, 'NICHD');
            return updatedCdeSaved;
        }
    }
}


async function runOneNichdForm(nichdFormName: string, nichdRows: any[], config: NichdConfig) {
    const nichdFormObj = await createNichdForm(nichdFormName, nichdRows, config);
    const nichdForm = await new formModel(nichdFormObj).save();
    newFormCount++;
    console.log(`newFormCount: ${newFormCount} newForm ${nichdForm.tinyId}`);
    await new formSourceModel(nichdFormObj).save();
}

async function run(config = DEFAULT_NICHD_CONFIG) {
    const workbook = XLSX.readFile(DMDXlsx);
    const nichdRows = XLSX.utils.sheet_to_json(workbook.Sheets['DMDSurveys_DataDictionary_2019-']);
    nichdRows.forEach((nichdRow: any) => {
        // change the section name from Bayley 3Rd Edition to: Bayley Scales of Infant and Toddler Development
        if (nichdRow['Form Name'] === 'bayley_3rd_edition') {
            nichdRow['Form Name'] = 'Bayley Scales of Infant and Toddler Development';
        }
        // NICHD picked a LOINC code for Non-English language (variable name: e_nel, row 30 in CSV) that is not actually a match.
        // For this one, don't use LOINC. Load it as a new CDE with their PVs.
        if (nichdRow['Field Label'] === 'Non-English language') {
            nichdRow.LOINC = '';
        }
    })
    await runOneNichdForm('NBSTRN Duchenne Muscular Dystrophy (DMD)', nichdRows, config);
}

const nichdConfig = new NichdConfig();
nichdConfig.classificationArray = ['NBSTRN Duchenne Muscular Dystrophy (DMD)'];

run(nichdConfig).then(() => {
    console.log('Finished loadNichdDmdByXlsx.');
    process.exit(0);
}, err => {
    console.log(err);
    process.exit(1);
});
