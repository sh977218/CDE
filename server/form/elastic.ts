import { config } from 'server';
import { CdeFormDocument } from 'server/form/mongo-form';
import { logError } from 'server/log/dbLogger';
import { buildElasticSearchQuery } from 'server/system/buildElasticSearchQuery';
import { elasticsearchPromise, esClient } from 'server/system/elastic';
import { riverFunction, suggestRiverFunction } from 'server/system/elasticSearchInit';
import { CdeForm } from 'shared/form/form.model';
import { copyShallow } from 'shared/util';
import { SearchResponseAggregationForm, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

export function updateOrInsert(elt: CdeForm): CdeForm {
    updateOrInsertImpl(copyShallow(elt));
    return elt;
}

export function updateOrInsertDocument(elt: CdeFormDocument) {
    return updateOrInsertImpl(elt.toObject());
}

export function updateOrInsertImpl(elt: CdeForm): void {
    riverFunction(elt, doc => {
        if (doc) {
            let doneCount = 0;
            const done = (err: Error | null) => {
                /* istanbul ignore if */
                if (err) {
                    logError({
                        message: 'Unable to Index document: ' + doc.elementType + ' ' + doc.tinyId,
                        origin: 'form.elastic.updateOrInsert',
                        stack: err.toString(),
                        details: '',
                    });
                }
                if (doneCount >= 1) {
                    return;
                }
                doneCount++;
            };
            delete doc._id;
            esClient.index(
                {
                    index: config.elastic.formIndex.name,
                    type: '_doc',
                    id: doc.tinyId,
                    body: doc,
                },
                done
            );
            suggestRiverFunction(elt, sugDoc => {
                esClient.index(
                    {
                        index: config.elastic.formSuggestIndex.name,
                        type: '_doc',
                        id: doc.tinyId,
                        body: sugDoc,
                    },
                    done
                );
            });
        }
    });
}

export function elasticsearchForm(
    settings: SearchSettingsElastic,
    user?: User
): Promise<SearchResponseAggregationForm> {
    if (!Array.isArray(settings.selectedElements)) {
        settings.selectedElements = [];
    }
    if (!Array.isArray(settings.selectedElementsAlt)) {
        settings.selectedElementsAlt = [];
    }
    const query = buildElasticSearchQuery('form', user, settings);
    if (query.from + query.size > 10000) {
        return Promise.reject('Exceeded pagination limit (10,000)');
    }
    if (!settings.fullRecord) {
        query._source = { excludes: ['flatProperties', 'properties', 'classification.elements', 'formElements'] };
    }

    // Filter by selected copyrightStatus
    if (settings.includeAggregations) {
        query.aggregations.copyrightStatus = {
            filter: settings.filterCopyrightStatus,
            aggs: { copyrightStatus: { terms: { field: 'copyrightStatus' } } },
        };
    }

    return elasticsearchPromise('form', query, settings);
}
