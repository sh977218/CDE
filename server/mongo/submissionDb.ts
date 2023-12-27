import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { SubmissionDocument, submissionModel } from 'server/mongo/mongoose/submission.mongoose';
import { BaseDb, CrudHooks, PromiseOrValue } from 'server/mongo/base/baseDb';
import { Submission, SubmissionDb } from 'shared/boundaryInterfaces/db/submissionDb';

const submissionHooks: CrudHooks<Submission, ObjectId> = {
    read: {
        post: (submission) => {
            return submission;
        },
    },
    save: {
        pre: (submission) => {
            submission.dateModified = new Date().toJSON();
            return submission;
        },
        post: (submission): Submission | null => {
            return submission;
        },
    },
    delete: {
        pre: (_id) => _id,
        post: (_id) => {},
    },
}

class SubmissionDbMongo extends BaseDb<Submission, ObjectId> implements SubmissionDb {
    constructor(model: Model<SubmissionDocument>) {
        super(model, submissionHooks, 'dateModified');
    }

    byId(id: string): Promise<Submission | null> {
        return this.findOneById(new ObjectId(id));
    }

    byNameAndVersion(name: string, version: string): Promise<Submission | null> {
        return this.findOne({name, version});
    }

    byKey(key: string): Promise<Submission | null> {
        return this.byId(key);
    }

    count(query: any): Promise<number> {
        return super.count(query);
    }

    deleteOneById(_id: ObjectId): Promise<void> {
        // caller deletes attachments
        return super.deleteOneById(_id);
    }

    query(query: any): Promise<Submission[]> {
        return this.model.find(query).then(r => r);
    }

    save(submission: Submission): Promise<Submission> {
        return Promise.resolve(this.hooks.save.pre(submission))
            .then(s => this.model.findOneAndReplace({_id: new ObjectId(s._id)}, s, {new: true, upsert: true}))
            .then(doc => doc.toObject<Submission>())
            .then(s => (this.hooks.save.post as (c: Submission) => PromiseOrValue<Submission>)(s)); // TODO: TypeScript/issues/37181
    }

    updatePropertiesById(_id: ObjectId, setExpression: Partial<Submission>): Promise<Submission | null> {
        return super.updatePropertiesById(_id, setExpression);
    }
}

export const submissionDb = new SubmissionDbMongo(submissionModel);
