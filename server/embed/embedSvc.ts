import { EmbedDocument, embedModel } from 'server/embed/embedDb';
import { CbError1, Embed } from 'shared/models.model';

export const embeds = {
    save: (embed: Embed, cb: CbError1<EmbedDocument>) => {
        if (embed._id) {
            const _id = embed._id;
            delete embed._id;
            embedModel.updateOne({_id}, embed, cb);
        } else {
            new embedModel(embed).save(cb);
        }
    },
    find: (crit: any, cb: CbError1<EmbedDocument[]>) => {
        embedModel.find(crit, cb);
    },
    delete: (id: string, cb: CbError1<EmbedDocument>) => {
        embedModel.remove({_id: id}, cb as any);
    }
};
