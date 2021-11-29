import { Document, Model } from 'mongoose';
import { updateOrInsert } from 'server/form/elastic';
import { formSchema } from 'server/form/schemas';
import { attachmentAdd, attachmentRemove, attachmentSetDefault } from 'server/mongo/shared/attachable';
import { byId } from 'server/mongo/shared/mongoUtils';
import { establishConnection } from 'server/system/connections';
import { config } from 'server/system/parseConfig';
import { FormDb } from 'shared/boundaryInterfaces/db/formDb';
import { CdeForm } from 'shared/form/form.model';
import { Attachment } from 'shared/models.model';

type FormDocument = Document & CdeForm;

const conn = establishConnection(config.database.appData);
const formModel: Model<FormDocument> = conn.model('Form', formSchema);

function postUpdate(elt: CdeForm): CdeForm {
    return updateOrInsert(elt); // updates elastic after returning
}

class FormDbMongo implements FormDb {
    attach(_id: string, attachment: Attachment): Promise<CdeForm> {
        return attachmentAdd(formModel, _id, attachment)
            .then(postUpdate);
    }

    byId(_id: string): Promise<CdeForm | null> {
        return byId(formModel, _id);
    }

    removeAttachment(_id: string, attachmentIndex: number): Promise<CdeForm> {
        return attachmentRemove(formModel, _id, attachmentIndex)
            .then(postUpdate);
    }

    setDefaultAttachment(_id: string, attachmentIndex: number, state: boolean): Promise<CdeForm> {
        return attachmentSetDefault(formModel, _id, attachmentIndex, state)
            .then(postUpdate);
    }
}

export const formDb = new FormDbMongo();
