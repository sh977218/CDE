import { ObjectId } from 'mongodb';
import { Cursor, Document, Model, QueryOptions } from 'mongoose';
import { config } from 'server';
import { submissionSchema } from 'server/mongo/mongoose/schema/submission.schema';
import { establishConnection } from 'server/system/connections';
import { Submission } from 'shared/boundaryInterfaces/db/submissionDb';

export type SubmissionDocument = Document<ObjectId, {}, Submission> & Submission;

const conn = establishConnection(config.database.appData);
export const submissionModel: Model<SubmissionDocument> = conn.model('submission', submissionSchema) as any;

export function getStream(condition: any): Cursor<SubmissionDocument, QueryOptions<Submission>> {
    return submissionModel.find(condition).sort({ _id: -1 }).cursor();
}
