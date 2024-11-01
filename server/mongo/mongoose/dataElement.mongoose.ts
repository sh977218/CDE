import * as Ajv from 'ajv';
import { isEmpty } from 'lodash';
import { config, ObjectId } from 'server';
import { Cursor, Document, Model, PreSaveMiddlewareFunction, QueryOptions } from 'mongoose';
import { updateOrInsertDocument } from 'server/cde/elastic';
import {
    auditSchema as deAuditSchema,
    dataElementSchema,
    dataElementSourceSchema,
    draftSchema,
} from 'server/mongo/mongoose/schema/dataElement.schema';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { DataElement as DataElementClient } from 'shared/de/dataElement.model';
import { EltLog } from 'shared/models.model';

export type DataElement = DataElementClient;
export type DataElementDocument = Document<ObjectId, {}, DataElement> & DataElement;
export type DataElementDraft = DataElement;
export type DataElementDraftDocument = Document<ObjectId, {}, DataElementDraft> & DataElementDraft;
export type DataElementSource = DataElement;
export type DataElementSourceDocument = Document<ObjectId, {}, DataElementSource> & DataElementSource;

const dataElementSchemaJson = require(global.assetDir('shared/de/assets/dataElement.schema.json'));

const ajvElt = new Ajv({ allErrors: true });
ajvElt.addSchema(require(global.assetDir('shared/de/assets/adminItem.schema')));
export let validateSchema: any;
try {
    const schema = dataElementSchemaJson;
    (schema as any).$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: dataElement.schema.json does not compile. ' + err);
    process.exit(1);
}

const preSave: PreSaveMiddlewareFunction<DataElementDocument> = function preSave(this, next) {
    const elt = this;

    /* istanbul ignore if */
    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(
        () => {
            try {
                updateOrInsertDocument(elt);
            } catch (exception) {
                errorLogger.error(`Error Indexing CDE ${elt.tinyId}`, {
                    details: exception,
                    stack: new Error().stack,
                });
            }

            const valueDomain = elt.valueDomain;
            /* istanbul ignore if */
            if (valueDomain.datatype === 'Value List' && isEmpty(valueDomain.permissibleValues)) {
                next(new Error(`Cde ${elt.tinyId} Value List with empty permissible values.`));
            } else {
                next();
            }
        },
        (err: any) => {
            err.tinyId = elt.tinyId;
            err.eltId = elt._id.toString();
            next(err);
        }
    );
};
dataElementSchema.pre('save', preSave);
dataElementSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
export const dataElementModel: Model<DataElement> = conn.model('DataElement', dataElementSchema);
export const dataElementDraftModel: Model<DataElementDraft> = conn.model('DataElementDraft', draftSchema);
export const dataElementSourceModel: Model<DataElementSource> = conn.model(
    'DataElementSource',
    dataElementSourceSchema
);
export const cdeAuditModel: Model<EltLog> = conn.model('CdeAudit', deAuditSchema);

export function getStream(condition: any): Cursor<DataElementDocument, QueryOptions<DataElement>> {
    return dataElementModel.find(condition).sort({ _id: -1 }).cursor();
}
