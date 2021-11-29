import { Document, Model } from 'mongoose';
import { updateOrInsert } from 'server/cde/elastic';
import { dataElementSchema } from 'server/cde/schemas';
import { attachmentAdd, attachmentRemove, attachmentSetDefault } from 'server/mongo/shared/attachable';
import { byId } from 'server/mongo/shared/mongoUtils';
import { establishConnection } from 'server/system/connections';
import { config } from 'server/system/parseConfig';
import { DataElementDb } from 'shared/boundaryInterfaces/db/dataElementDb';
import { DataElement } from 'shared/de/dataElement.model';
import { Attachment } from 'shared/models.model';

type DataElementDocument = Document & DataElement;

const conn = establishConnection(config.database.appData);
const dataElementModel: Model<DataElementDocument> = conn.model('DataElement', dataElementSchema);

function postUpdate(elt: DataElement): DataElement {
    return updateOrInsert(elt); // updates elastic after returning
}

class DataElementDbMongo implements DataElementDb {
    attach(_id: string, attachment: Attachment): Promise<DataElement> {
        return attachmentAdd(dataElementModel, _id, attachment)
            .then(postUpdate);
    }

    byId(_id: string): Promise<DataElement | null> {
        return byId(dataElementModel, _id);
    }

    removeAttachment(_id: string, attachmentIndex: number): Promise<DataElement> {
        return attachmentRemove(dataElementModel, _id, attachmentIndex)
            .then(postUpdate);
    }

    setDefaultAttachment(_id: string, attachmentIndex: number, state: boolean): Promise<DataElement> {
        return attachmentSetDefault(dataElementModel, _id, attachmentIndex, state)
            .then(postUpdate);
    }
}

export const dataElementDb = new DataElementDbMongo();
