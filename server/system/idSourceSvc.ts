import { dbPlugins } from 'server/app';
import { IdSource } from 'shared/models.model';

export async function getAllIdSources() {
    return dbPlugins.idSource.findAll();
}

export async function isSourceById(id: string): Promise<IdSource | null> {
    return dbPlugins.idSource.findById(id);
}

export async function createIdSource(id: string, body: IdSource): Promise<IdSource> {
    return dbPlugins.idSource.save({
        _id: id,
        linkTemplateDe: body.linkTemplateDe,
        linkTemplateForm: body.linkTemplateForm,
        version: body.version,
    });
}

export async function updateIdSource(sourceId: string, sourceBody: IdSource): Promise<void> {
    return dbPlugins.idSource.updateById(sourceId, sourceBody);
}

export async function deleteIdSource(sourceId: string) {
    return dbPlugins.idSource.deleteById(sourceId);
}
