export function wipeUseless(elt) {
    delete elt._id;
    delete elt.__v;
    delete elt.version;
    delete elt.tinyId;
    delete elt.imported;
    delete elt.created;
    delete elt.createdBy;
    delete elt.updated;
    delete elt.updatedBy;
    delete elt.changeNote;
    delete elt.source;
    delete elt.archived;
    delete elt.views;
    delete elt.sources;

    delete elt.naming;
    delete elt.classification;
    delete elt.attachments;
    delete elt.derivationRules;
    delete elt.lastMigrationScript;
    delete elt.registrationState;
    delete elt.history;
    delete elt.comments;
}
