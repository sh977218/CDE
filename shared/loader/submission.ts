import { ArrayToType } from 'shared/models.model';

export const submissionAttachmentType = ['attachmentWorkbook', 'attachmentLicense', 'attachmentSupporting'] as const;
export type SubmissionAttachmentType = ArrayToType<typeof submissionAttachmentType>;
