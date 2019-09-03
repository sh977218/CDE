import { config } from 'server/system/parseConfig';
const elastic = require('../system/elastic');
const mongoCde = require('../cde/mongo-cde');

export let syncLinkedFormsProgress: any = {done: 0, total: 0};

async function extractedSyncLinkedForms(cde) {
    const esResult = await elastic.esClient.search({
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

    esResult.hits.hits.forEach(h => {
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

    elastic.esClient.update({
        index: config.elastic.index.name,
        type: 'dataelement',
        id: cde.tinyId,
        body: {doc: {linkedForms}}
    });
    syncLinkedFormsProgress.done++;
    return new Promise(resolve => resolve());
}

export function syncLinkedFormsByTinyId(tinyId) {
    return new Promise(resolve => {
        mongoCde.byTinyId(tinyId, (err, cde) => {
            extractedSyncLinkedForms(cde).then(resolve);
        });
    });
}

export async function syncLinkedForms() {
    const t0 = Date.now();
    syncLinkedFormsProgress = {done: 0, total: 0};
    const cdeCursor = mongoCde.getStream({archived: false});
    syncLinkedFormsProgress.total = await mongoCde.count({archived: false});
    for (let cde = await cdeCursor.next(); cde != null; cde = await cdeCursor.next()) {
        await extractedSyncLinkedForms(cde);
    }
    syncLinkedFormsProgress.timeTaken = Date.now() - t0;
}
