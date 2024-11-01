import { config, ObjectId } from 'server';
import {
    cdeAuditModel,
    DataElement,
    DataElementDocument,
    DataElementDraft,
    DataElementDraftDocument,
    dataElementDraftModel,
    dataElementModel,
    dataElementSourceModel,
} from 'server/mongo/mongoose/dataElement.mongoose';
import { auditModifications, generateTinyId, updateElt, updateMetadata } from 'server/system/mongo-data';
import { wipeDatatype } from 'shared/de/dataElement.model';
import { UpdateEltOptions } from 'shared/de/updateEltOptions';
import { User } from 'shared/models.model';

const auditModificationsDe = auditModifications(cdeAuditModel);

export function byTinyId(tinyId: string): Promise<DataElementDocument | null> {
    return dataElementModel.findOne({ tinyId, archived: false }).then();
}

export function draftById(_id: ObjectId): Promise<DataElementDraftDocument | null> {
    return dataElementDraftModel.findOne({ _id }).then();
}

export function draftByTinyId(tinyId: string): Promise<DataElementDraftDocument | null> {
    return dataElementDraftModel
        .findOne({
            archived: false,
            tinyId,
        })
        .then();
}

export function draftDelete(tinyId: string): Promise<void> {
    return dataElementDraftModel.deleteMany({ tinyId }).then();
}

export function draftsList(criteria: any): Promise<DataElementDraftDocument[]> {
    return dataElementDraftModel
        .find(criteria, {
            'designations.designation': 1,
            'stewardOrg.name': 1,
            tinyId: 1,
            updated: 1,
            'updatedBy.username': 1,
        })
        .sort({ updated: -1 })
        .exec();
}

export function draftSave(elt: DataElement, user: User): Promise<DataElementDocument | null> {
    wipeDatatype(elt);
    updateMetadata(elt, user);
    return dataElementDraftModel.findById(elt._id).then(doc => {
        if (!doc) {
            return new dataElementDraftModel(elt).save();
        }
        /* istanbul ignore if */
        if (doc.__v !== elt.__v) {
            return Promise.resolve(null);
        }
        const version = elt.__v;
        elt.__v++;
        return dataElementDraftModel.findOneAndUpdate({ _id: elt._id, __v: version }, elt, { new: true }).then();
    });
}

/* ---------- PUT NEW REST API Implementation above  ---------- */

const viewedCdes: Record<string, number> = {};
const threshold = config.viewsIncrementThreshold;

export function inCdeView(cde: DataElement) {
    if (!viewedCdes[cde._id]) {
        viewedCdes[cde._id] = 0;
    }
    viewedCdes[cde._id]++;
    if (viewedCdes[cde._id] >= threshold && cde && cde._id) {
        viewedCdes[cde._id] = 0;
        dataElementModel.updateOne({ _id: cde._id }, { $inc: { views: threshold } }).exec();
    }
}

export function create(elt: DataElement, user: User): Promise<DataElementDocument> {
    wipeDatatype(elt);
    elt.created = Date.now();
    elt.createdBy = {
        username: user.username,
    };
    const newItem = new dataElementModel(elt);
    newItem.tinyId = generateTinyId();
    return newItem.save().then(newElt => {
        auditModificationsDe(user, null, newElt);
        return newElt;
    });
}

export function update(
    elt: DataElementDraft,
    user: User,
    options: UpdateEltOptions = {}
): Promise<DataElementDocument> {
    // version and changeNote are already saved on the draft
    return dataElementModel.findById(elt._id, null, null).then(dbDataElement => {
        /* istanbul ignore if */
        if (!dbDataElement) {
            throw new Error('Document Not Found');
        }
        /* istanbul ignore if */
        if (dbDataElement.archived) {
            throw new Error('You are trying to edit an archived element');
        }
        updateElt(elt, dbDataElement, user);
        wipeDatatype(elt);

        // user cannot edit sources.
        if (!options.updateSource) {
            elt.sources = dbDataElement.sources;
        }

        // because it's draft not edit attachment
        if (!options.updateAttachments) {
            elt.attachments = dbDataElement.attachments;
        }

        // created & createdBy cannot be changed.
        elt.created = dbDataElement.created;
        elt.createdBy = dbDataElement.createdBy;

        const newElt = new dataElementModel(elt);

        // archive dataElement and replace it with newElt
        return dataElementModel
            .findOneAndUpdate(
                {
                    _id: dbDataElement._id,
                    archived: false,
                },
                { $set: { archived: true } },
                null
            )
            .then(oldElt => {
                /* istanbul ignore if */
                if (!oldElt) {
                    throw new Error('Document not found');
                }
                return newElt.save().then(
                    savedElt => {
                        auditModificationsDe(user, dbDataElement, savedElt);
                        return savedElt;
                    },
                    err =>
                        dataElementModel
                            .findOneAndUpdate({ _id: dbDataElement._id }, { $set: { archived: false } })
                            .then(() => Promise.reject(err))
                );
            });
    });
}

export function derivationByInputs(inputTinyId: string): Promise<DataElementDocument[]> {
    return dataElementModel.find({ archived: false, 'derivationRules.inputs': inputTinyId }).exec();
}

export function findModifiedElementsSince(date: Date | string | number): Promise<DataElementDocument[]> {
    return dataElementModel.aggregate([
        {
            $match: {
                archived: false,
                updated: { $gte: date },
            },
        },
        { $limit: 2000 },
        { $sort: { updated: -1 } },
        { $group: { _id: '$tinyId' } } as any,
    ]);
}

export function originalSourceByTinyIdSourceName(
    tinyId: string,
    sourceName: string
): Promise<DataElementDocument | null> {
    return dataElementSourceModel.findOne({ tinyId, source: sourceName });
}
