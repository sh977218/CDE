import { ObjectId } from 'server';
import {
    formAuditModel,
    FormDocument,
    FormDraftDocument,
    formDraftModel,
    formModel,
    formSourceModel,
} from 'server/mongo/mongoose/form.mongoose';
import { auditModifications, generateTinyId, updateElt, updateMetadata } from 'server/system/mongo-data';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { CdeForm } from 'shared/form/form.model';
import { User } from 'shared/models.model';

const auditModificationsForm = auditModifications(formAuditModel);

export function byTinyId(tinyId: string): Promise<FormDocument | null> {
    return formModel.findOne({ archived: false, tinyId }).then();
}

export function draftById(_id: ObjectId): Promise<FormDocument> {
    return formDraftModel
        .findOne({
            _id,
            elementType: 'form',
        } as Partial<CdeForm>)
        .then();
}

export function draftByTinyId(tinyId: string): Promise<FormDraftDocument> {
    return formDraftModel
        .findOne({
            tinyId,
            archived: false,
            elementType: 'form',
        } as Partial<CdeForm>)
        .then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return formDraftModel.deleteMany({ tinyId }).then();
}

export function draftsList(criteria: any): Promise<FormDraftDocument[]> {
    return formDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({ updated: -1 })
        .then();
}

export function draftSave(elt: CdeForm, user: User): Promise<FormDocument | null> {
    updateMetadata(elt, user);
    return formDraftModel.findById(elt._id).then(doc => {
        if (!doc) {
            return new formDraftModel(elt).save();
        }
        if (doc.__v !== elt.__v) {
            return null;
        }
        const version = elt.__v;
        elt.__v++;
        return formDraftModel.findOneAndUpdate({ _id: elt._id, __v: version }, elt, { new: true }).then();
    });
}

/* ---------- PUT NEW REST API above ---------- */

export function update(elt: CdeForm, user: User, options: UpdateEltOptions = {}): Promise<FormDocument> {
    return formModel.findById(elt._id, null, null).then(dbForm => {
        /* istanbul ignore if */
        if (!dbForm) {
            throw new Error('Document does not exist.');
        }
        /* istanbul ignore if */
        if (dbForm.archived) {
            throw new Error('You are trying to edit an archived element');
        }

        updateElt(elt, dbForm, user);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = dbForm.sources;
        }

        // because it's draft not edit attachment
        if (!options.updateAttachments) {
            elt.attachments = dbForm.attachments;
        }

        // loader skip update formElements, i.e. Qualified PhenX forms, PHQ-9
        /* istanbul ignore if */
        if (options.skipFormElements) {
            elt.formElements = dbForm.formElements;
        }

        // created & createdBy cannot be changed.
        elt.created = dbForm.created;
        elt.createdBy = dbForm.createdBy;

        // updated by special process, not editing
        elt.isBundle = dbForm.isBundle;

        const newElt = new formModel(elt);

        // archive form and replace it with newElt
        return formModel
            .findOneAndUpdate(
                {
                    _id: dbForm._id,
                    archived: false,
                },
                { $set: { archived: true } },
                null
            )
            .then(oldElt => {
                /* istanbul ignore if */
                if (!oldElt) {
                    throw new Error('document not found');
                }
                return newElt.save().then(
                    savedElt => {
                        auditModificationsForm(user, dbForm, savedElt);
                        return savedElt;
                    },
                    err =>
                        formModel
                            .findOneAndUpdate({ _id: dbForm._id }, { $set: { archived: false } })
                            .then(/* istanbul ignore next */ () => Promise.reject(err))
                );
            });
    });
}

export function create(elt: CdeForm, user: User): Promise<FormDocument> {
    elt.created = Date.now();
    elt.createdBy = {
        username: user.username,
    };
    const newItem = new formModel(elt);
    newItem.tinyId = generateTinyId();
    return newItem.save().then(newElt => {
        auditModificationsForm(user, null, newElt);
        return newElt;
    });
}

export function originalSourceByTinyIdSourceName(tinyId: string, sourceName: string): Promise<FormDocument | null> {
    return formSourceModel.findOne({ tinyId, source: sourceName });
}
