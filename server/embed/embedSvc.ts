import { EmbedDocument, embedModel } from 'server/embed/embedDb';
import { CbError, Embed } from 'shared/models.model';

export const embeds = {
    save: (embed: Embed, cb: CbError<EmbedDocument>) => {
        if (embed._id) {
            const _id = embed._id;
            delete embed._id;
            embedModel.updateOne({_id}, embed, cb);
        } else {
            new embedModel(embed).save(cb);
        }
    },
    find: (crit: any, cb: CbError<EmbedDocument[]>) => {
        embedModel.find(crit, cb);
    },
    delete: (id: string, cb: CbError<EmbedDocument>) => {
        embedModel.remove({_id: id}, cb);
    }
};
