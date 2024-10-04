import {
    AggregationsAggregationContainer,
    QueryDslOperator,
    QueryDslQueryContainer,
    SearchHighlight,
} from '@elastic/elasticsearch/api/types';
import { myOrgs } from 'server/orgManagement/orgSvc';
import {
    getAllowedStatuses,
    hideRetired,
    termAdminStatus,
    termCopyrightStatus,
    termDatatype,
    termRegStatus,
    termStewardOrg,
} from 'server/system/elastic';
import {
    ElasticSearchRequestBody,
    esqAggregate,
    esqBool,
    esqBoolFilter,
    esqBoolMust,
    esqBoolShould,
    esqTerm,
} from 'shared/elastic';
import { CurationStatus, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

const endorsedBoost: string = '1.2';
const script = `
        if (doc['nihEndorsed'].value == true) { 
            return _score * ${endorsedBoost};
        } else {
            return _score;
        }
    `;

function escapeRegExp(str: string) {
    // @ts-ignore
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace('<', '');
}

export function buildElasticSearchQueryCde(
    user: User | undefined,
    settings: SearchSettingsElastic
): ElasticSearchRequestBody {
    return buildElasticSearchQuery('cde', user, settings);
}

export function buildElasticSearchQueryForm(
    user: User | undefined,
    settings: SearchSettingsElastic
): ElasticSearchRequestBody {
    return buildElasticSearchQuery('form', user, settings);
}

export function buildElasticSearchQueryBoard(
    user: User | undefined,
    settings: SearchSettingsElastic
): ElasticSearchRequestBody {
    return buildElasticSearchQuery('board', user, settings);
}

export function buildElasticSearchQueryOrg(
    user: User | undefined,
    settings: SearchSettingsElastic
): ElasticSearchRequestBody {
    return buildElasticSearchQuery('org', user, settings);
}

function buildElasticSearchQuery(
    module: string,
    user: User | undefined,
    settings: SearchSettingsElastic
): ElasticSearchRequestBody {
    if (!Array.isArray(settings.excludeOrgs)) {
        settings.excludeOrgs = [];
    }
    if (!Array.isArray(settings.selectedCopyrightStatus)) {
        settings.selectedCopyrightStatus = [];
    }
    if (!Array.isArray(settings.selectedDatatypes)) {
        settings.selectedDatatypes = [];
    }
    if (!Array.isArray(settings.selectedElements)) {
        settings.selectedElements = [];
    }
    if (!Array.isArray(settings.selectedElementsAlt)) {
        settings.selectedElementsAlt = [];
    }
    if (!Array.isArray(settings.selectedStatuses)) {
        settings.selectedStatuses = [];
    }
    if (!Array.isArray(settings.selectedAdminStatuses)) {
        settings.selectedAdminStatuses = [];
    }

    const from = generateFrom(settings);
    const size = generateSize(settings);
    if ((from ?? 0) + (size ?? 0) > 10000) {
        throw new Error('page size exceeded');
    }

    return {
        query: generateQuery(user, settings),
        aggregations: generateAggregation(module, user, settings),
        post_filter: generatePostFilter(user, settings),
        from,
        size,
        sort: generateSort(settings),
        highlight: generateHighlight(),
    };
}

function generateQuery(user: User | undefined, settings: SearchSettingsElastic): QueryDslQueryContainer {
    // ElasticSearch Reserved Characters(some are used by power users): + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /
    settings.searchTerm = settings.searchTerm?.replace(/(?<=[^\\])\//g, '\\/'); // escape /
    const hasSearchTerm = !!settings.searchTerm;

    const boolMust0DismaxQueries: QueryDslQueryContainer[] = [
        {
            function_score: {
                query: hasSearchTerm
                    ? {
                          query_string: {
                              analyze_wildcard: true,
                              default_operator: 'AND' as QueryDslOperator,
                              query: settings.searchTerm || '',
                          },
                      }
                    : undefined,
                functions: [
                    {
                        script_score: { script },
                    },
                ],
            },
        },
    ];
    if (hasSearchTerm) {
        const query1 = {
            function_score: {
                boost: 2.5,
                query: {
                    // Boost rank if matches are on designation or definition
                    query_string: {
                        fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                        analyze_wildcard: true,
                        default_operator: 'AND' as QueryDslOperator,
                        query: settings.searchTerm || '',
                    },
                },
                functions: [
                    {
                        script_score: { script },
                    },
                ],
            },
        };
        boolMust0DismaxQueries.push(query1);
        // Boost rank if we find exact string match, or if terms are in a less than 4 terms apart.
        if ((settings.searchTerm || '').indexOf('"') < 0) {
            query1.function_score.boost = 2;
            boolMust0DismaxQueries.push({
                function_score: {
                    boost: 4,
                    query: {
                        query_string: {
                            fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                            analyze_wildcard: true,
                            default_operator: 'AND',
                            query: '"' + settings.searchTerm + '"~4',
                        },
                    },
                    functions: [
                        {
                            script_score: { script },
                        },
                    ],
                },
            });
        }
    }

    const boolMust: QueryDslQueryContainer[] = [
        {
            dis_max: {
                queries: boolMust0DismaxQueries,
            },
        },
    ];
    const boolMustNot: QueryDslQueryContainer[] = [];
    const filterOR: QueryDslQueryContainer[] = getAllowedStatuses(user, settings).map(termRegStatus);

    if (hideRetired(settings, user)) {
        boolMustNot.push(termRegStatus('Retired'));
    }

    // if I'm one or more organizations' orgAdmin, orgEditor or orgCurator, I'll be able to see those Orgs all status
    const organizationsUserBelongsTo = myOrgs(user);
    if (organizationsUserBelongsTo.length) {
        filterOR.push(
            esqBoolMust([
                esqBoolShould(organizationsUserBelongsTo.map(termStewardOrg)),
                esqBoolShould((['Incomplete', 'Candidate'] as CurationStatus[]).map(termRegStatus)),
            ])
        );
    }

    if (settings.nihEndorsed) {
        boolMust.push(esqTerm('nihEndorsed', true));
    }
    if (settings.selectedOrg) {
        boolMust.push(esqTerm('classification.stewardOrg.name', settings.selectedOrg));
    }
    if (settings.selectedOrgAlt) {
        boolMust.push(esqTerm('classification.stewardOrg.name', settings.selectedOrgAlt));
    }

    if (settings.excludeAllOrgs) {
        boolMust.push(esqTerm('classificationSize', 1));
    } else {
        if (settings.excludeOrgs && settings.excludeOrgs.length > 0) {
            settings.excludeOrgs.forEach(o => {
                boolMustNot.push(esqTerm('classification.stewardOrg.name', o));
            });
        }
    }

    const flatSelection = settings.selectedElements ? settings.selectedElements.join(';') : '';
    if (settings.selectedOrg && flatSelection !== '') {
        boolMust.push(esqTerm('flatClassifications', settings.selectedOrg + ';' + flatSelection));
    }
    const flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(';') : '';
    if (settings.selectedOrgAlt && flatSelectionAlt !== '') {
        boolMust.push(esqTerm('flatClassifications', settings.selectedOrgAlt + ';' + flatSelectionAlt));
    }

    // filter by topic
    if (settings.meshTree) {
        // boost for those with fewer mesh trees
        boolMust.push({
            dis_max: {
                queries: [
                    {
                        function_score: {
                            functions: [
                                {
                                    script_score: {
                                        script:
                                            "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) /" +
                                            " (doc['flatMeshTrees'].length + 1)",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        });
        boolMust.push(esqTerm('flatMeshTrees', settings.meshTree));
    }

    return esqBool(null, boolMust, esqBoolShould(filterOR), boolMustNot);
}

function generateFrom(settings: SearchSettingsElastic) {
    let from = ((settings.page || 0) - 1) * settings.resultPerPage;
    if (!from || from < 0) {
        from = 0;
    }
    return from;
}

function generateSize(settings: SearchSettingsElastic) {
    let size: number;
    if (settings.resultPerPage > 100) {
        size = 100;
    } else {
        size = settings.resultPerPage || 20;
    }
    return size;
}

function generateSort(settings: SearchSettingsElastic) {
    const hasSearchTerm = !!settings.searchTerm;
    let sort: Record<string, 'asc' | 'desc'> = {};
    if (!hasSearchTerm) {
        sort = {
            nihEndorsed: 'desc',
            'primaryNameCopy.raw': 'asc',
        };
    }
    return sort;
}

function generateAggregation(
    module: string,
    user: User | undefined,
    settings: SearchSettingsElastic
): Record<string, AggregationsAggregationContainer> {
    // the 4 multiselect aggregations: registrationStatus, administrativeStatus, datatype(CDE), copyright(Form)
    const selectedStatuses = settings.selectedStatuses.map(termRegStatus);
    const selectedAdminStatuses = settings.selectedAdminStatuses.map(termAdminStatus);
    const selectedDatatypes = settings.selectedDatatypes.map(termDatatype);
    const selectedCopyrightStatus = settings.selectedCopyrightStatus.map(termCopyrightStatus);

    const copyrightFilters: QueryDslQueryContainer[] = [];
    const datatypeFilters: QueryDslQueryContainer[] = [];
    const flatClassificationFilters: QueryDslQueryContainer[] = [];
    const flatClassificationAltFilters: QueryDslQueryContainer[] = [];
    const meshTreeFilters: QueryDslQueryContainer[] = [];
    const orgFilters: QueryDslQueryContainer[] = [];
    const statusFilters: QueryDslQueryContainer[] = [];
    const adminStatusFilters: QueryDslQueryContainer[] = [];
    const twoLevelMeshFilters: QueryDslQueryContainer[] = [];

    if (selectedStatuses.length) {
        // does not include statuses agg
        const statusTerms = esqBoolShould(selectedStatuses);
        adminStatusFilters.push(statusTerms);
        datatypeFilters.push(statusTerms);
        copyrightFilters.push(statusTerms);
        orgFilters.push(statusTerms);
        meshTreeFilters.push(statusTerms);
        twoLevelMeshFilters.push(statusTerms);
        flatClassificationFilters.push(statusTerms);
        flatClassificationAltFilters.push(statusTerms);
    }
    if (selectedAdminStatuses.length) {
        // does not include admin statuses org
        const adminStatusTerms = esqBoolShould(selectedAdminStatuses);
        statusFilters.push(adminStatusTerms);
        datatypeFilters.push(adminStatusTerms);
        copyrightFilters.push(adminStatusTerms);
        orgFilters.push(adminStatusTerms);
        meshTreeFilters.push(adminStatusTerms);
        twoLevelMeshFilters.push(adminStatusTerms);
        flatClassificationFilters.push(adminStatusTerms);
        flatClassificationAltFilters.push(adminStatusTerms);
    }
    if (selectedDatatypes.length) {
        // does not include datatype agg
        const datatypeTerms = esqBoolShould(selectedDatatypes);
        statusFilters.push(datatypeTerms);
        adminStatusFilters.push(datatypeTerms);
        copyrightFilters.push(datatypeTerms);
        orgFilters.push(datatypeTerms);
        meshTreeFilters.push(datatypeTerms);
        flatClassificationFilters.push(datatypeTerms);
        flatClassificationAltFilters.push(datatypeTerms);
    }
    if (module === 'form' && selectedCopyrightStatus.length) {
        // does not include copyrightStatus agg
        const copyrightStatusTerms = esqBoolShould(selectedCopyrightStatus);
        statusFilters.push(copyrightStatusTerms);
        adminStatusFilters.push(copyrightStatusTerms);
        datatypeFilters.push(copyrightStatusTerms);
        orgFilters.push(copyrightStatusTerms);
        meshTreeFilters.push(copyrightStatusTerms);
        twoLevelMeshFilters.push(copyrightStatusTerms);
        flatClassificationFilters.push(copyrightStatusTerms);
        flatClassificationAltFilters.push(copyrightStatusTerms);
    }

    const aggregation: Record<string, AggregationsAggregationContainer> = {
        orgs: esqAggregate('orgs', orgFilters, {
            field: 'classification.stewardOrg.name',
            size: 500,
            order: { _key: 'desc' },
        }),
        statuses: esqAggregate('statuses', statusFilters, { field: 'registrationState.registrationStatus' }),
        adminStatuses: esqAggregate('adminStatuses', adminStatusFilters, { field : 'registrationState.administrativeStatus' }),
        meshTrees: esqAggregate('meshTrees', meshTreeFilters, {
            include: settings.meshTree?.length ? escapeRegExp(settings.meshTree) + ';[^;]+' : '[^;]+',
            field: 'flatMeshTrees',
            size: 50,
        }),
        twoLevelMesh: esqAggregate('twoLevelMesh', twoLevelMeshFilters, {
            size: 500,
            field: 'flatMeshTrees',
            include: '[^;]+;[^;]+',
        }),
    };
    if (module === 'cde') {
        aggregation.datatype = esqAggregate('datatype', datatypeFilters, { field: 'valueDomain.datatype' });
    }
    if (module === 'form') {
        aggregation.copyrightStatus = esqAggregate('copyrightStatus', copyrightFilters, { field: 'copyrightStatus' });
    }
    if (settings.selectedOrg && settings.selectedElements) {
        aggregation.flatClassifications = esqAggregate('flatClassifications', flatClassificationFilters, {
            field: 'flatClassifications',
            include: escapeRegExp([settings.selectedOrg].concat(settings.selectedElements).join(';')) + ';[^;]+',
            size: 500,
        });
    }
    if (settings.selectedOrgAlt && settings.selectedElementsAlt) {
        aggregation.flatClassificationsAlt = esqAggregate('flatClassificationsAlt', flatClassificationAltFilters, {
            field: 'flatClassifications',
            include: escapeRegExp([settings.selectedOrgAlt].concat(settings.selectedElementsAlt).join(';')) + ';[^;]+',
            size: 500,
        });
    }

    return aggregation;
}

// need to do filter after the search because the 4 multiselect aggregations do not filter so are not a part of the query
function generatePostFilter(user: User | undefined, settings: SearchSettingsElastic): QueryDslQueryContainer {
    // the 4 multiselect aggregations: registrationStatus, administrativeStatus, datatype(CDE), copyright(Form)
    const filters: QueryDslQueryContainer[] = [];
    const selectedStatuses = settings.selectedStatuses.map(termRegStatus);
    const selectedAdminStatuses = settings.selectedAdminStatuses.map(termAdminStatus);
    const selectedDatatypes = settings.selectedDatatypes.map(termDatatype);
    const selectedCopyrightStatus = settings.selectedCopyrightStatus.map(termCopyrightStatus);

    if (selectedStatuses.length) {
        filters.push(esqBoolShould(selectedStatuses));
    }
    if (selectedAdminStatuses.length) {
        filters.push(esqBoolShould(selectedAdminStatuses));
    }
    if (selectedDatatypes.length) {
        filters.push(esqBoolShould(selectedDatatypes));
    }
    if (selectedCopyrightStatus.length) {
        filters.push(esqBoolShould(selectedCopyrightStatus));
    }

    return esqBoolFilter(filters);
}

function generateHighlight(): SearchHighlight {
    // highlight search results if part of the following fields.
    return {
        require_field_match: false,
        fragment_size: 150,
        order: 'score',
        pre_tags: ['<strong>'],
        post_tags: ['</strong>'],
        fields: {
            'stewardOrgCopy.name': {},
            primaryNameCopy: {},
            primaryDefinitionCopy: { number_of_fragments: 1 },
            'designations.designation': {},
            'definitions.definition': {},
            'dataElementConcept.concepts.name': {},
            'dataElementConcept.concepts.origin': {},
            'dataElementConcept.concepts.originId': {},
            'property.concepts.name': {},
            'property.concepts.origin': {},
            'property.concepts.originId': {},
            'objectClass.concepts.name': {},
            'objectClass.concepts.origin': {},
            'objectClass.concepts.originId': {},
            'valueDomain.datatype': {},
            'valueDomain.permissibleValues.permissibleValue': {},
            'valueDomain.permissibleValues.valueMeaningName': {},
            'valueDomain.permissibleValues.valueMeaningCode': {},
            flatProperties: {},
            flatIds: {},
            'classification.stewardOrg.name': {},
            'classification.elements.name': {},
            'classification.elements.elements.name': {},
            'classification.elements.elements.elements.name': {},
        },
    };
}
