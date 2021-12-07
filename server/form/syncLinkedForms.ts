import { config, dbPlugins } from 'server';
import { esClient } from 'server/system/elastic';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeFormElastic } from 'shared/form/form.model';
import { ElasticQueryResponse } from 'shared/models.model';
import { getStream } from 'server/mongo/mongoose/dataElement.mongoose';

export let syncLinkedFormsProgress: any = {done: 0, total: 0};

async function extractedSyncLinkedForms(cde: DataElement) {
    const esResult: {body: ElasticQueryResponse<CdeFormElastic>} = await esClient.search({
        index: config.elastic.formIndex.name,
        q: cde.tinyId,
        size: 200
    });

    const linkedForms: any = {
        Retired: 0,
        Incomplete: 0,
        Candidate: 0,
        Recorded: 0,
        Qualified: 0,
        Standard: 0,
        'Preferred Standard': 0,
        forms: []
    };

    esResult.body.hits.hits.forEach(h => {
        linkedForms.forms.push({
            tinyId: h._source.tinyId,
            registrationStatus: h._source.registrationState.registrationStatus,
            primaryName: h._source.primaryNameCopy
        });
        linkedForms[h._source.registrationState.registrationStatus]++;
    });

    linkedForms.Standard += linkedForms['Preferred Standard'];
    linkedForms.Qualified += linkedForms.Standard;
    linkedForms.Recorded += linkedForms.Qualified;
    linkedForms.Candidate += linkedForms.Recorded;
    linkedForms.Incomplete += linkedForms.Candidate;
    linkedForms.Retired += linkedForms.Incomplete;

    esClient.update({
        index: config.elastic.index.name,
        type: '_doc',
        id: cde.tinyId,
        body: {doc: {linkedForms}}
    }).catch(err => console.log(err));
    syncLinkedFormsProgress.done++;
    return Promise.resolve();
}

export function syncLinkedFormsByTinyId(tinyId: string): Promise<void> {
    return dbPlugins.dataElement.byTinyId(tinyId).then(cde => {
        if (cde) {
            return extractedSyncLinkedForms(cde);
        }
    }, () => {});
}

export async function syncLinkedForms() {
    const t0 = Date.now();
    syncLinkedFormsProgress = {done: 0, total: 0};
    const cdeCursor = getStream({archived: false});
    syncLinkedFormsProgress.total = await dbPlugins.dataElement.count({archived: false});
    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        await extractedSyncLinkedForms(cde);
    }
    syncLinkedFormsProgress.timeTaken = Date.now() - t0;
}
