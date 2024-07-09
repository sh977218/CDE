import 'server/globals';
import {Model} from 'mongoose';
import {
    formDraftModel,
    formModel,
    formSourceModel
} from 'server/form/mongo-form';
import {
    dataElementDraftModel,
    dataElementModel,
    dataElementSourceModel
} from 'server/cde/mongo-cde';
import {Elt} from "shared/models.model";

process.on('unhandledRejection', (error) => {
    console.log(error);
});

const NAME_SOURCE_MAP: Record<string, string> = {
    NHLBI: 'NHLBI CONNECTS',
    'Project 5 (COVID-19)': 'Project 5',
    'Project 5': 'Project 5',
    ScHARe: 'NIMHD ScHARe'
}

const ERROR_LOG: string[] = [];

async function doOneCollection(collection: Model<Elt>) {
    const cond = {
        nihEndorsed: true,
        archived: false
    };
    const cursor = collection.find(cond).cursor();
    return cursor.eachAsync(async (model) => {
        const modelObj = model.toObject();
        console.log(`Starting ${modelObj.tinyId}...`);
        const stewardOrg = modelObj.stewardOrg.name;
        const nameSource = NAME_SOURCE_MAP[stewardOrg]
        if (nameSource) {
            [modelObj.designations, modelObj.definitions].forEach(designationsOrDefinitions => {
                designationsOrDefinitions.forEach(designationOrDefinition => {
                    designationOrDefinition.sources = [nameSource]
                })
            })
            model.designations = modelObj.designations
            model.definitions = modelObj.definitions
            model.changeNote = 'Update Name Source';
        } else {
            const errorInfo = `name source map not found. ${modelObj.elementType}     ${modelObj.tinyId}     ${stewardOrg}`;
            ERROR_LOG.push(errorInfo)
        }

        // fix stewardOrg name. scripts/changeProject5OrgName.ts did not update all collections
        if (stewardOrg === 'Project 5') {
            model.stewardOrg.name = 'Project 5 (COVID-19)';
        }

        await model.save();
        console.log(`Completed ${modelObj.tinyId}...`);
    });
}

function run() {
    const tasks = [
        dataElementModel,
        dataElementDraftModel,
        dataElementSourceModel,
        formModel,
        formDraftModel,
        formSourceModel
    ].map((model: any) => doOneCollection(model));
    Promise.all(tasks).then(() => {
        console.log('done');
        process.exit(0);
    }, err => {
        console.log('err ' + err);
        process.exit(1);
    }).finally(() => {
        console.info(ERROR_LOG)
    });
}

run();
