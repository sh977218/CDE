import { BaseDb } from 'server/mongo/base/baseDb';
import { Attachable } from 'shared/boundaryInterfaces/db/tags/attachableDb';
import { Attachment } from 'shared/models.model';

export abstract class AttachableDb<T extends Attachable, U> extends BaseDb<T, U> {
    protected attachmentAdd(_id: U, attachment: Attachment): Promise<T | null> {
        return this.updateById(_id, {$push: {attachments: attachment}})
            .then(t => this.hooks.save.post(t));
    }

    protected attachmentRemove(_id: U, attachmentIndex: number): Promise<T | null> {
        return this.updateById(_id, {$unset: {[`attachments.${attachmentIndex}`]: 1}})
            .then(() => this.updateById(_id, {$pull: {attachments: null}}))
            .then(t => this.hooks.save.post(t));
    }

    protected attachmentSetDefault(_id: U, attachmentIndex: number, state: boolean): Promise<T | null> {
        return this.updateById(_id, {$set: {'attachments.$[].isDefault': false}})
            .then(() => this.updateById(_id, {$set: {[`attachments.${attachmentIndex}.isDefault`]: state}}))
            .then(t => this.hooks.save.post(t));
    }
}
