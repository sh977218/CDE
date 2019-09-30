import {
    deleteIdSourceById, findAllIdSources, findById, IdSource, IdSourceDocument, saveIdSource, updateIdSourceById
} from 'server/system/idSourceDb';

export async function getAllIdSources() {
    return findAllIdSources();
}

export async function isSourceById(id: string): Promise<IdSourceDocument | null> {
    return findById(id);
}

export async function createIdSource(id: string, body: IdSource): Promise<IdSourceDocument> {
    const idSource = {
        _id: id,
        linkTemplateDe: body.linkTemplateDe,
        linkTemplateForm: body.linkTemplateForm,
        version: body.version,
    };
    return saveIdSource(idSource);
}

export async function updateIdSource(sourceId: string, sourceBody: IdSource): Promise<IdSourceDocument> {
    return updateIdSourceById(sourceId, sourceBody);
}

export async function deleteIdSource(sourceId: string) {
    return deleteIdSourceById(sourceId);
}
