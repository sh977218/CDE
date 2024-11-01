import * as mongoose from 'mongoose';
import { IndexDirection, Schema } from 'mongoose';
import { ObjectId } from 'server';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { Submission } from 'shared/boundaryInterfaces/db/submissionDb';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;

const submissionAttachmentSchema = {
    fileId: StringType,
    filename: StringType,
    uploadedBy: StringType,
    uploadedDate: StringType,
};

export const submissionSchema = new Schema<Submission>(
    {
        name: { type: StringType, required: true },
        version: { type: StringType, required: true },
        endorsed: Boolean,
        administrativeStatus: { type: StringType, required: true },
        attachmentLicense: submissionAttachmentSchema,
        attachmentSupporting: submissionAttachmentSchema,
        attachmentWorkbook: submissionAttachmentSchema,
        registrationStatus: { type: StringType, required: true },
        submitterId: { type: ObjectId, required: true },
        collectionUrl: { type: StringType, required: true },
        collectionDescription: { type: StringType, required: true },
        dateModified: Date,
        dateSubmitted: Date,
        licenseAttribution: Boolean,
        licenseCost: Boolean,
        licenseInformation: StringType,
        licenseOther: Boolean,
        licensePermission: Boolean,
        licensePublic: Boolean,
        licenseTraining: Boolean,
        nihInitiative: { type: StringType, required: true },
        nihInitiativeBranch: StringType,
        additionalInformation: StringType,
        submitterEmail: StringType,
        submitterOrganization: StringType,
        submitterNameTitle: StringType,
        submitterNameFirst: StringType,
        submitterNameMi: StringType,
        submitterNameLast: StringType,
        organizationEmail: StringType,
        organizationUrl: StringType,
        organizationPocTitle: StringType,
        organizationPocFirst: StringType,
        organizationPocMi: StringType,
        organizationPocLast: StringType,
        organizationCurators: [StringType],
        nlmCurators: [StringType],
        governanceReviewers: [StringType],
    },
    {
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    }
);

submissionSchema.set('collection', 'submission');
submissionSchema.index({ name: 1, version: 1 } as Record<keyof Submission, IndexDirection>, { unique: true });
