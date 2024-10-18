import { EmbedDocument, embedModel } from 'server/embed/embedDb';
import { CbError1, Embed } from 'shared/models.model';

export const embeds = {
    save: (embed: Embed, cb: CbError1<EmbedDocument | void>) => {
        if (embed._id) {
            const _id = embed._id;
            delete embed._id;
            embedModel.updateOne({ _id }, embed, cb);
        } else {
            new embedModel(embed).save().then((e: EmbedDocument) => cb(null, e), cb);
        }
    },
    find: (crit: any, cb: CbError1<EmbedDocument[]>) => {
        embedModel.find(crit).then(
            result => cb(null, result) as any,
            err => cb(err, [])
        );
    },
    delete: (id: string, cb: CbError1<EmbedDocument | null>) => {
        embedModel.deleteOne({ _id: id }).then(
            result => cb(null, null),
            err => cb(err, null)
        );
    },
};
