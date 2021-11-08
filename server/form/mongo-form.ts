import * as Ajv from 'ajv';
import { readdirSync, readFileSync } from 'fs';
import { Document, HookNextFunction, Model } from 'mongoose';
import { resolve } from 'path';
import { EltLogDocument } from 'server/cde/mongo-cde';
import { splitError } from 'server/errorHandler/errorHandler';
import { byTinyIdList as elasticByTinyIdList } from 'server/form/elastic';
import { updateOrInsert } from 'server/form/elastic';
import { auditSchema, draftSchema, formSchema, formSourceSchema } from 'server/form/schemas';
import { establishConnection } from 'server/system/connections';
import { errorLogger } from 'server/system/logging';
import { ItemDao } from 'server/system/itemDao';
import { DaoModule } from 'server/system/moduleDao';
import { attachables, auditGetLog, auditModifications, eltAsElastic, generateTinyId } from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { CdeForm, CdeFormElastic } from 'shared/form/form.model';
import { CbError, CbError1, User } from 'shared/models.model';

export type CdeFormDocument = Document & CdeForm;
export type CdeFormDraft = CdeForm;
export type CdeFormDraftDocument = Document & CdeFormDraft;
export type CdeFormSource = CdeForm;
export type CdeFormSourceDocument = Document & CdeFormSource;

const ajvElt = new Ajv({allErrors: true});
readdirSync(resolve(global.appDir('shared/de/assets/'))).forEach(file => {
    if (file.indexOf('.schema.json') > -1) {
        ajvElt.addSchema(require(global.appDir('shared/de/assets', file)));
    }
});
export let validateSchema: any;
const file = readFileSync(resolve(global.appDir('shared/form/assets/form.schema.json')));
try {
    const schema = JSON.parse(file.toString());
    schema.$async = true;
    validateSchema = validateSchema = ajvElt.compile(schema);
} catch (err) {
    console.log('Error: form.schema.json does not compile. ' + err);
    process.exit(1);
}

function preSaveUsesThisForSomeReason(this: CdeFormDocument, next: HookNextFunction) {
    const elt = this;

    if (elt.archived) {
        return next();
    }
    validateSchema(elt).then(() => {
        try {
            updateOrInsert(elt);
        } catch (exception) {
            // TODO: remove logging, error is passed out of this layer, handleError should fail-back and tee to no-db logger
            errorLogger.error(`Error Indexing Form ${elt.tinyId}`, {
                details: exception,
                stack: new Error().stack
            });
        }
        next();
    }, (err: any) => {
        err.tinyId = elt.tinyId;
        err.eltId = elt._id.toString();
        next(err);
    });
}
formSchema.pre('save', preSaveUsesThisForSomeReason);
formSourceSchema.pre('save', preSaveUsesThisForSomeReason);

const conn = establishConnection(config.database.appData);
export const formModel: Model<CdeFormDocument> = conn.model('Form', formSchema);
const formAuditModel: Model<EltLogDocument> = conn.model('FormAudit', auditSchema);
export const formDraftModel: Model<CdeFormDraftDocument> = conn.model('Draft', draftSchema);
export const formSourceModel: Model<CdeFormSourceDocument> = conn.model('formsources', formSourceSchema);

const auditModificationsForm = auditModifications(formAuditModel);
export const getAuditLog = auditGetLog(formAuditModel);
attachables.push(formModel);

export function byExisting(elt: CdeForm): Promise<CdeFormDocument | null>;
export function byExisting(elt: CdeForm, cb: CbError1<CdeFormDocument | null>): void;
export function byExisting(elt: CdeForm, cb?: CbError1<CdeFormDocument | null>): Promise<CdeFormDocument | null> | void {
    formModel.findOne({_id: elt._id, tinyId: elt.tinyId}, cb);
}

export function byId(id: string): Promise<CdeFormDocument | null>;
export function byId(id: string, cb: CbError1<CdeFormDocument | null>): void;
export function byId(id: string, cb?: CbError1<CdeFormDocument | null>): Promise<CdeFormDocument | null> | void {
    return formModel.findById(id).exec(cb);
}

export function byTinyId(tinyId: string): Promise<CdeFormDocument | null>;
export function byTinyId(tinyId: string, cb: CbError1<CdeFormDocument | null>): void;
export function byTinyId(tinyId: string, cb?: CbError1<CdeFormDocument | null>): Promise<CdeFormDocument | null> | void {
    return formModel.findOne({archived: false, tinyId}).exec(cb);
}

export function byTinyIdAndVersion(tinyId: string, version: string | undefined): Promise<CdeFormDocument | null>;
export function byTinyIdAndVersion(tinyId: string, version: string | undefined, cb: CbError1<CdeFormDocument | null>): void;
export function byTinyIdAndVersion(tinyId: string, version: string | undefined, cb?: CbError1<CdeFormDocument | null>): Promise<CdeFormDocument | null> | void {
    const query: any = {tinyId};
    if (version) {
        query.version = version;
    } else {
        query.$or = [{version: null}, {version: ''}];
    }
    return formModel.findOne(query).sort({updated: -1}).limit(1).exec(cb);
}

export function byTinyIdListElastic(tinyIdList: string[], cb: CbError1<CdeFormElastic[] | void>): void {
    formModel.find({archived: false})
        .where('tinyId').in(tinyIdList)
        .slice('valueDomain.permissibleValues', 10)
        .exec((err, docs) => {
            if (err) {
                return cb(err);
            }
            const cdes = docs.map(eltAsElastic);
            cb(err, tinyIdList.map(t => cdes.filter(cde => cde.tinyId === t)[0]).filter(cde => !!cde));
        });
}

export function byTinyIdVersion(tinyId: string, version: string | undefined, cb: CbError1<CdeFormDocument | null>) {
    if (version) {
        byTinyIdAndVersion(tinyId, version, cb);
    } else {
        byTinyId(tinyId, cb);
    }
}

export function draftById(id: string, cb: CbError1<CdeFormDocument>) {
    const cond: Partial<CdeForm> = {
        _id: id,
        elementType: 'form'
    };
    formDraftModel.findOne(cond, cb);
}

export function draftByTinyId(tinyId: string, cb: CbError1<CdeFormDraftDocument>) {
    const cond: Partial<CdeForm> = {
        tinyId,
        archived: false,
        elementType: 'form'
    };
    formDraftModel.findOne(cond, cb);
}

export function draftDelete(tinyId: string, cb: CbError) {
    formDraftModel.remove({tinyId}, cb);
}

export function draftsList(criteria: any): Promise<CdeFormDraftDocument[]>;
export function draftsList(criteria: any, cb: CbError1<CdeFormDraftDocument[]>): void;
export function draftsList(criteria: any, cb?: CbError1<CdeFormDraftDocument[]>): void | Promise<CdeFormDraftDocument[]> {
    return formDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1
        })
        .sort({updated: -1})
        .exec(cb);
}

export function draftSave(elt: CdeForm, user: User, cb: CbError1<CdeFormDocument | void>) {
    updateUser(elt, user);
    formDraftModel.findById(elt._id, splitError(cb, doc => {
        if (!doc) {
            new formDraftModel(elt).save(cb);
            return;
        }
        if (doc.__v !== elt.__v) {
            cb(null);
            return;
        }
        const version = elt.__v;
        elt.__v++;
        formDraftModel.findOneAndUpdate({_id: elt._id, __v: version}, elt, {new: true},
            (err, doc) => cb(err, doc === null ? undefined : doc));
    }));
}

export function latestVersionByTinyId(tinyId: string, cb: CbError1<string | undefined>) {
    formModel.findOne({tinyId, archived: false}, (err, form) => {
        cb(err, form ? form.version : undefined);
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function getStream(condition: any) {
    return formModel.find(condition).sort({_id: -1}).cursor();
}

export function count(condition: any, callback: CbError1<number>) {
    return formModel.countDocuments(condition, callback);
}

export function update(elt: CdeForm, user: User, options: any = {}, callback: CbError1<CdeForm | void> = () => {
}) {
    formModel.findById(elt._id, (err, form) => {
        if (err || !form) {
            return callback(err || new Error('Document does not exist.'));
        }
        if (form.archived) {
            return callback(new Error('You are trying to edit an archived element'));
        }
        delete elt._id;
        if (!elt.history) {
            elt.history = [];
        }
        elt.history.push(form._id);
        updateUser(elt, user);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = form.sources;
        }

        // because it's draft not edit attachment
        if (options.updateAttachments) {
            elt.attachments = form.attachments;
        }

        // loader skip update formElements, i.e. Qualified PhenX forms, PHQ-9
        if (options.skipFormElements) {
            elt.formElements = form.formElements;
        }

        // created & createdBy cannot be changed.
        elt.created = form.created;
        elt.createdBy = form.createdBy;


        const newElt = new formModel(elt);

        // archive form and replace it with newElt
        formModel.findOneAndUpdate({_id: form._id, archived: false}, {$set: {archived: true}}, (err, doc) => {
            if (err || !doc) {
                return callback(err, doc === null ? undefined : doc);
            }
            newElt.save((err, savedElt) => {
                if (err) {
                    formModel.findOneAndUpdate({_id: form._id}, {$set: {archived: false}}, () => callback(err));
                } else {
                    callback(null, savedElt);
                    auditModificationsForm(user, form, savedElt);
                }
            });
        });
    });
}

export function create(elt: CdeForm, user: User, callback: CbError1<CdeFormDocument>) {
    elt.created = Date.now();
    elt.createdBy = {
        userId: user._id,
        username: user.username
    };
    const newItem = new formModel(elt);
    newItem.tinyId = generateTinyId();
    newItem.save((err, newElt) => {
        callback(err, newElt);
        if (!err) {
            auditModificationsForm(user, null, newElt);
        }
    });
}

export function byTinyIdListInOrder(idList: string[], callback: CbError1<(CdeFormElastic | undefined)[] | void>) {
    byTinyIdListElastic(idList, (err, forms) => {
        if (err || !forms) {
            return callback(err || new Error('forms not found'));
        }
        const reorderedForms = idList.map(id => {
            for (const form of forms) {
                if (id === form.tinyId) {
                    return form;
                }
            }
        });
        callback(err, reorderedForms);
    });
}

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string, cb: CbError1<CdeFormDocument>) {
    formSourceModel.findOne({tinyId, source: sourceName}, cb);
}

export const daoItem: ItemDao<CdeForm, CdeFormElastic> = {
    type: 'form',
    _model: formModel,
    byExisting,
    byId,
    byTinyId,
    byTinyIdAndVersion,
    byTinyIdListElastic,
    elastic: {
        byTinyIdList: elasticByTinyIdList,
    },
};

export const daoModule: DaoModule<CdeFormDocument> = {
    type: 'form',
    _model: formModel,
    byKey: byTinyId,
};

function updateUser(elt: CdeForm, user: User) {
    elt.updated = new Date();
    elt.updatedBy = {
        userId: user._id,
        username: user.username
    };
}
