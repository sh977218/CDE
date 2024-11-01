import { Cursor, Document, Model, QueryOptions } from 'mongoose';
import { config, ObjectId } from 'server';
import { submissionSchema } from 'server/mongo/mongoose/schema/submission.schema';
import { establishConnection } from 'server/system/connections';
import { Submission as SubmissionClient } from 'shared/boundaryInterfaces/db/submissionDb';

export type Submission = Omit<SubmissionClient, 'submitterId'> & { submitterId: ObjectId };
export type SubmissionDocument = Document<ObjectId, {}, Submission> & Submission;

const conn = establishConnection(config.database.appData);
export const submissionModel: Model<Submission> = conn.model('submission', submissionSchema);

export function getStream(condition: any): Cursor<SubmissionDocument, QueryOptions<Submission>> {
    return submissionModel.find(condition).sort({ _id: -1 }).cursor();
}
