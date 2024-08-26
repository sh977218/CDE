import { config, dbPlugins } from 'server';
import { getStream } from 'server/mongo/mongoose/dataElement.mongoose';
import { esClient } from 'server/system/elastic';
import { DataElement, DataElementElastic } from 'shared/de/dataElement.model';
import { ElasticSearchResponseBody } from 'shared/elastic';
import { CdeFormElastic } from 'shared/form/form.model';

export let syncLinkedFormsProgress: any = {done: 0, total: 0};

async function extractedSyncLinkedForms(cde: DataElement) {
    const esResult: { body: ElasticSearchResponseBody<CdeFormElastic> } = await esClient.search<CdeFormElastic>({
        index: config.elastic.formIndex.name,
        q: cde.tinyId,
        size: 200
    });

    const linkedForms: DataElementElastic['linkedForms'] = {
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
        if (!h._source) {
            return;
        }
        linkedForms.forms.push({
            tinyId: h._source.tinyId,
            registrationStatus: h._source.registrationState.registrationStatus,
            primaryName: h._source.primaryNameCopy,
            noRenderAllowed: h._source.noRenderAllowed
        });
        linkedForms[h._source.registrationState.registrationStatus]++;
    });

    linkedForms.Standard += linkedForms['Preferred Standard'];
    linkedForms.Qualified += linkedForms.Standard;
    linkedForms.Recorded += linkedForms.Qualified;
    linkedForms.Candidate += linkedForms.Recorded;
    linkedForms.Incomplete += linkedForms.Candidate;
    linkedForms.Retired += linkedForms.Incomplete;

    const noRenderAllowed = linkedForms.forms.length &&
        linkedForms.forms.filter(f => f.noRenderAllowed).length === linkedForms.forms.length;

    esClient.update({
        index: config.elastic.index.name,
        type: '_doc',
        id: cde.tinyId,
        body: {doc: {linkedForms, noRenderAllowed}}
    }).catch(err => console.log(err));
    esClient.update({
        index: config.elastic.cdeSuggestIndex.name,
        type: '_doc',
        id: cde.tinyId,
        body: {doc: {noRenderAllowed}}
    }).catch(err => console.log(err));
    syncLinkedFormsProgress.done++;
    return Promise.resolve();
}

export function syncLinkedFormsByCdeTinyId(tinyId: string): Promise<void> {
    return dbPlugins.dataElement.byTinyId(tinyId).then(cde => {
        if (cde) {
            return extractedSyncLinkedForms(cde);
        }
    }, () => {
    });
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
