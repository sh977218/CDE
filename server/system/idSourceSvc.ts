import {
    deleteIdSourceById, findAllIdSources, findById, saveIdSource, updateIdSourceById
} from 'server/system/idSourceDb';

export async function getAllIdSources() {
    return findAllIdSources();
}

export async function isSourceById(id) {
    return findById(id);
}

export async function createIdSource(id, body) {
    const idSource = {
        _id: id,
        linkTemplateDe: body.linkTemplateDe,
        linkTemplateForm: body.linkTemplateForm,
        version: body.version,
    };
    return saveIdSource(idSource);
}

export async function updateIdSource(sourceId, sourceBody) {
    return updateIdSourceById(sourceId, sourceBody);
}

export async function deleteIdSource(sourceId) {
    return deleteIdSourceById(sourceId);
}
