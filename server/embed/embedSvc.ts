import { Embeds } from 'server/embed/embedDb';
export const embeds = {
    save: (embed, cb) => {
        if (embed._id) {
            const _id = embed._id;
            delete embed._id;
            Embeds.updateOne({_id}, embed, cb);
        } else {
            new Embeds(embed).save(cb);
        }
    },
    find: (crit, cb) => {
        Embeds.find(crit, cb);
    },
    delete: (id, cb) => {
        Embeds.remove({_id: id}, cb);
    }
};