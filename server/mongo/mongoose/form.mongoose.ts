import * as Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import { ObjectId } from 'mongodb';
import { Cursor, Document, Model, PreSaveMiddlewareFunction, QueryOptions } from 'mongoose';
import { resolve } from 'path';
import { config } from 'server';
import { updateOrInsertDocument } from 'server/form/elastic';
import {
    auditSchema as formAuditSchema,
    draftSchema,
    formSchema,
    formSourceSchema,
} from 'server/mongo/mongoose/schema/form.schema';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { CdeForm as CdeFormClient, CdeFormDraft } from 'shared/form/form.model';
import { EltLog } from 'shared/models.model';

export type CdeForm = CdeFormClient;
export type FormDocument = Document<ObjectId, {}, CdeForm> & CdeForm;
export type FormDraft = CdeFormDraft;
export type FormDraftDocument = Document<ObjectId, {}, FormDraft> & FormDraft;
export type FormSource = CdeForm;
export type FormSourceDocument = Document<ObjectId, {}, FormSource> & FormSource;

const ajvElt = new Ajv({ allErrors: true });
readdirSync(resolve(global.assetDir('shared/de/assets/'))).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require(global.assetDir('shared/de/assets', file)));
    }
});
export let validateSchema: any;
const file = readFileSync(resolve(global.assetDir('shared/form/assets/form.schema.json')));
try {
    const schema = JSON.parse(file.toString());
    schema.$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: form.schema.json does not compile. ' + err);
    process.exit(1);
}

const preSave: PreSaveMiddlewareFunction<FormDocument> = function preSave(this: FormDocument, next) {
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
                // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
                errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                    details: exception,
                    stack: new Error().stack,
                });
            }
            next();
        },
        (err: any) => {
            err.tinyId = elt.tinyId;
            err.eltId = elt._id.toString();
            next(err);
        }
    );
};
formSchema.pre('save', preSave);
formSourceSchema.pre('save', preSave);

const conn = establishConnection(config.database.appData);
export const formModel: Model<CdeForm> = conn.model('Form', formSchema);
export const formDraftModel: Model<FormDraft> = conn.model('Draft', draftSchema);
export const formSourceModel: Model<FormSource> = conn.model('formsources', formSourceSchema);
export const formAuditModel: Model<EltLog> = conn.model('FormAudit', formAuditSchema);

export function getStream(condition: any): Cursor<FormDocument, QueryOptions<CdeForm>> {
    return formModel.find(condition).sort({ _id: -1 }).cursor();
}
