import * as mongoose from 'mongoose';
import { JobStatus, Message } from 'server/system/mongo-data';
import { addStringtype } from './mongoose-stringtype';
import { orderedList } from 'shared/regStatusShared';
import { administrativeStatuses } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

export const csEltSchema = new Schema(
    {
        elements: [],
        name: { type: StringType, index: true },
    },
    { _id: false }
);

export const classificationSchema = new Schema(
    {
        stewardOrg: {
            name: { type: StringType, index: true },
        },
        workingGroup: Boolean,
        elements: [csEltSchema],
    },
    { _id: false }
);

export const codeAndSystemSchema = new Schema(
    {
        code: StringType,
        system: StringType,
    },
    { _id: false }
);

export const permissibleValueSchema = new Schema(
    {
        permissibleValue: StringType,
        valueMeaningName: StringType,
        valueMeaningCode: StringType,
        valueMeaningDefinition: StringType,
        codeSystemName: StringType,
        codeSystemVersion: StringType,
        conceptId: StringType,
        conceptSource: StringType,
    },
    { _id: false }
);

export const derivationRuleSchema = new Schema(
    {
        name: StringType,
        inputs: { type: [StringType], description: 'Information operated on by rule' },
        outputs: { type: [StringType], description: 'Information produced by rule' },
        ruleType: { type: StringType, enum: ['score', 'panel'] },
        formula: { type: StringType, enum: ['sumAll', 'mean', 'bmi'] },
    },
    { _id: false }
);

export const sourceSchema = new Schema(
    {
        sourceName: StringType,
        imported: { type: Date, description: 'Date imported from source' },
        created: { type: Date, description: 'Date created in source' },
        updated: { type: Date, description: 'Date updated in source' },
        registrationStatus: {
            type: StringType,
            description: "Relative standing of official record status in steward's workflow",
        },
        administrativeStatus: {
            type: StringType,
            description: 'Administration status of the original source',
        },
        datatype: { type: StringType, description: 'May contain the source datatype' },
        copyright: {
            value: { type: StringType, description: 'Content of a copyright statement or terms of use' },
            valueFormat: { type: StringType, description: 'If "html", interpret as HTML' },
        },
    },
    { _id: false }
);

export const sourcesNewSchema = new Schema(
    {
        type: Map,
        of: [sourceSchema],
    },
    { _id: false }
);

export const statusValidationRuleSchema = new Schema({
    field: StringType,
    id: Number,
    targetStatus: {
        type: StringType,
        enum: ['Incomplete', 'Recorded', 'Candidate', 'Qualified', 'Standard', 'Preferred Standard'],
    },
    ruleName: StringType,
    rule: {
        customValidations: [StringType],
        regex: StringType,
    },
    occurence: { type: StringType, enum: ['exactlyOne', 'atLeastOne', 'all'] },
});

export const designationSchema = new Schema(
    {
        designation: StringType,
        tags: { type: [StringType], default: [] },
        sources: { type: [StringType], default: [] },
    },
    { _id: false }
);

export const definitionSchema = new Schema(
    {
        definition: { type: String, required: true, minlength: 1 },
        definitionFormat: StringType,
        tags: { type: [StringType], default: [] },
        sources: { type: [StringType], default: [] },
    },
    { _id: false }
);

export const attachmentSchema = new Schema(
    {
        fileid: { type: StringType, index: true },
        filename: StringType,
        filetype: StringType,
        uploadDate: Date,
        comment: StringType,
        uploadedBy: {
            username: { type: StringType, index: true },
        },
        filesize: Number,
        isDefault: Boolean,
        pendingApproval: { type: Boolean, index: true },
        scanned: Boolean,
    },
    { _id: false }
);

export const registrationStateSchema = new Schema(
    {
        registrationStatus: { type: StringType, enum: orderedList, default: 'Incomplete' },
        effectiveDate: Date,
        untilDate: Date,
        administrativeNote: StringType,
        unresolvedIssue: StringType,
        administrativeStatus: {
            type: StringType,
            enum: administrativeStatuses,
            description: "Relative standing of CDE as it relates to steward's administrative workflow",
        },
        replacedBy: { tinyId: { type: StringType, description: 'tinyId of replacement CDE' } },
        mergedTo: { tinyId: { type: StringType, description: 'tinyId CDE was merged to' } },
    },
    { _id: false }
);

export const propertySchema = new Schema(
    {
        key: StringType,
        value: StringType,
        source: StringType,
        valueFormat: StringType,
    },
    { _id: false }
);

export const idSchema = new Schema(
    {
        source: StringType,
        id: StringType,
        version: StringType,
    },
    { _id: false }
);

const requestSchema = {
    source: { tinyId: StringType, id: StringType },
    destination: { tinyId: StringType },
    mergeFields: {
        ids: Boolean,
        designations: Boolean,
        definitions: Boolean,
        attachments: Boolean,
        properties: Boolean,
        classifications: Boolean,
    },
};

export const eltLogSchema = {
    date: { type: Date, default: Date.now, index: true },
    user: {
        username: StringType,
    },
    adminItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType,
    },
    previousItem: {
        tinyId: StringType,
        version: StringType,
        _id: Schema.Types.ObjectId,
        name: StringType,
    },
    diff: Object,
};

const elementRefSchema = {
    eltId: StringType,
    eltType: { type: StringType, enum: ['board', 'cde', 'form'] },
    name: StringType,
};

const commentApprovalSchema = {
    comment: {
        commentId: StringType,
        replyIndex: Number,
        text: StringType,
    },
    element: elementRefSchema,
};

const boardApprovalSchema = {
    element: elementRefSchema,
};

export const message = new Schema<Message>(
    {
        recipient: {
            name: StringType,
            recipientType: { type: StringType, enum: ['user', 'stewardOrg', 'role'] },
        },
        author: { authorType: StringType, name: StringType },
        date: Date,
        type: { type: StringType, enum: ['AttachmentApproval', 'CommentReply', 'BoardApproval'] },
        typeRequest: requestSchema,
        typeCommentApproval: commentApprovalSchema,
        typeAttachmentApproval: attachmentSchema,
        typeCommentReply: commentApprovalSchema,
        typeBoardApproval: boardApprovalSchema,
        states: [
            {
                action: { type: StringType, enum: ['Approved', 'Filed'] },
                comment: StringType,
                date: Date,
            },
        ],
    },
    { collection: 'messages' }
);

export const jobQueue = new Schema<JobStatus>(
    {
        type: StringType,
        status: { type: StringType, enum: ['Running'] },
        error: StringType,
    },
    {}
);

export const referenceDocumentSchema = new Schema(
    {
        docType: StringType,
        document: StringType,
        referenceDocumentId: StringType,
        text: StringType,
        uri: StringType,
        providerOrg: StringType,
        title: StringType,
        languageCode: StringType,
        source: StringType,
    },
    { _id: false }
);

export const dataSetSchema = new Schema(
    {
        source: StringType,
        id: StringType,
        studyUri: StringType,
        notes: StringType,
    },
    { _id: false }
);

export const classificationAudit = new Schema(
    {
        date: { type: Date, default: Date.now, index: true },
        user: {
            username: StringType,
        },
        elements: [
            {
                tinyId: StringType,
                version: StringType,
                _id: Schema.Types.ObjectId,
                name: StringType,
                status: { type: StringType, enum: orderedList },
                eltType: { type: StringType, enum: ['cde', 'form'] },
            },
        ],
        newname: StringType,
        action: { type: StringType, enum: ['add', 'delete', 'rename', 'reclassify'] },
        path: [StringType],
    },
    { collection: 'classificationAudit' }
);

export const datatypeTextSchema = new Schema(
    {
        minLength: { type: Number, description: 'To indicate limits on length' },
        maxLength: { type: Number, description: 'To indicate limits on length' },
        regex: { type: StringType, description: 'To indicate a regular expression that someone may want to match on' },
        rule: { type: StringType, description: 'Any rule may go here' },
        showAsTextArea: { type: Boolean, description: 'Multi-line' },
    },
    { _id: false }
);

export const datatypeNumberSchema = new Schema(
    {
        minValue: Number,
        maxValue: Number,
        precision: Number,
    },
    { _id: false }
);

export const datatypeDateSchema = new Schema(
    {
        precision: {
            type: StringType,
            enum: ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'],
        },
    },
    { _id: false }
);

export const datatypeTimeSchema = new Schema(
    {
        format: StringType,
    },
    { _id: false }
);

export const datatypeValueListSchema = new Schema(
    {
        datatype: { type: StringType, description: 'Value list format' },
    },
    { _id: false }
);

export const datatypeDynamicListSchema = new Schema(
    {
        system: { type: StringType, description: 'Code System' },
        code: { type: StringType, description: 'Code' },
    },
    { _id: false }
);

export const datatypeExternallyDefinedSchema = new Schema(
    {
        link: { type: StringType, description: 'A link to an external source. Typically a URL' },
        description: StringType,
        descriptionFormat: { type: StringType, description: "if 'html', then parse with HTML" },
    },
    { _id: false }
);
