import {
    getAllowedStatuses,
    hideRetired,
    termCopyrightStatus,
    termDatatype,
    termRegStatus,
    termStewardOrg,
} from 'server/system/elastic';
import { CurationStatus, User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { myOrgs } from '../orgManagement/orgSvc';

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

export function buildElasticSearchQueryCde(user: User | undefined, settings: SearchSettingsElastic) {
    return buildElasticSearchQuery('cde', user, settings);
}

export function buildElasticSearchQueryForm(user: User | undefined, settings: SearchSettingsElastic) {
    return buildElasticSearchQuery('form', user, settings);
}

export function buildElasticSearchQueryBoard(user: User | undefined, settings: SearchSettingsElastic) {
    return buildElasticSearchQuery('board', user, settings);
}

export function buildElasticSearchQueryOrg(user: User | undefined, settings: SearchSettingsElastic) {
    return buildElasticSearchQuery('org', user, settings);
}

function buildElasticSearchQuery(module: string, user: User | undefined, settings: SearchSettingsElastic) {
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

    const query = generateQuery(user, settings);
    const aggregations = generateAggregation(module, user, settings);
    const post_filter = generatePostFilter(user, settings);
    const from = generateFrom(settings);
    const size = generateSize(settings);
    const sort = generateSort(settings);
    const highlight = generateHighlight();
    const elasticQueryBody: any = {
        query,
        aggregations,
        post_filter,
        from,
        size,
        sort,
        highlight,
    };

    if (elasticQueryBody.from + elasticQueryBody.size > 10000) {
        throw new Error('page size exceeded');
    }

    return elasticQueryBody;
}

function generateQuery(user: User | undefined, settings: SearchSettingsElastic) {
    // ElasticSearch Reserved Characters(some are used by power users): + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /
    settings.searchTerm = settings.searchTerm?.replace(/(?<=[^\\])\//g, '\\/'); // escape /
    const hasSearchTerm = !!settings.searchTerm;
    const query: any = {
        bool: {
            must: [
                {
                    dis_max: {
                        queries: [
                            {
                                function_score: {
                                    query: hasSearchTerm
                                        ? {
                                              query_string: {
                                                  analyze_wildcard: true,
                                                  default_operator: 'AND',
                                                  query: settings.searchTerm,
                                              },
                                          }
                                        : undefined,
                                    script_score: { script },
                                },
                            },
                        ],
                    },
                },
            ],
            must_not: [],
            filter: [{ bool: { should: getAllowedStatuses(user, settings).map(termRegStatus) } }],
        },
    };

    if (hasSearchTerm) {
        query.bool.must[0].dis_max.queries.push({
            function_score: {
                boost: '2.5',
                query: {
                    // Boost rank if matches are on designation or definition
                    query_string: {
                        fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                        analyze_wildcard: true,
                        default_operator: 'AND',
                        query: settings.searchTerm,
                    },
                },
                script_score: { script },
            },
        });
        // Boost rank if we find exact string match, or if terms are in a less than 4 terms apart.
        if ((settings.searchTerm || '').indexOf('"') < 0) {
            query.bool.must[0].dis_max.queries[1].function_score.boost = '2';
            query.bool.must[0].dis_max.queries.push({
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
                    script_score: { script },
                },
            });
        }
    }

    if (hideRetired(settings, user)) {
        query.bool.must_not.push(termRegStatus('Retired'));
    }

    // if I'm one or more organizations' orgAdmin, orgEditor or orgCurator, I'll be able to see those Orgs all status
    const organizationsUserBelongsTo = myOrgs(user);
    if (organizationsUserBelongsTo.length) {
        query.bool.filter[0].bool.should.push({
            bool: {
                must: [
                    {
                        bool: {
                            should: organizationsUserBelongsTo.map(termStewardOrg),
                        },
                    },
                    {
                        bool: {
                            should: (['Incomplete', 'Candidate'] as CurationStatus[]).map(termRegStatus),
                        },
                    },
                ],
            },
        });
    }

    if (settings.nihEndorsed) {
        query.bool.must.push({ term: { nihEndorsed: true } });
    }
    if (settings.selectedOrg) {
        query.bool.must.push({ term: { 'classification.stewardOrg.name': settings.selectedOrg } });
    }
    if (settings.selectedOrgAlt) {
        query.bool.must.push({ term: { 'classification.stewardOrg.name': settings.selectedOrgAlt } });
    }

    if (settings.excludeAllOrgs) {
        query.bool.must.push({ term: { classificationSize: 1 } });
    } else {
        if (settings.excludeOrgs && settings.excludeOrgs.length > 0) {
            settings.excludeOrgs.forEach(o => {
                query.bool.must_not.push({ term: { 'classification.stewardOrg.name': o } });
            });
        }
    }

    const flatSelection = settings.selectedElements ? settings.selectedElements.join(';') : '';
    if (settings.selectedOrg && flatSelection !== '') {
        query.bool.must.push({ term: { flatClassifications: settings.selectedOrg + ';' + flatSelection } });
    }
    const flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(';') : '';
    if (settings.selectedOrgAlt && flatSelectionAlt !== '') {
        query.bool.must.push({
            term: { flatClassifications: settings.selectedOrgAlt + ';' + flatSelectionAlt },
        });
    }

    // filter by topic
    if (settings.meshTree) {
        // boost for those with fewer mesh trees
        query.bool.must.push({
            dis_max: {
                queries: [
                    {
                        function_score: {
                            script_score: {
                                script:
                                    "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) /" +
                                    " (doc['flatMeshTrees'].length + 1)",
                            },
                        },
                    },
                ],
            },
        });
        query.bool.must.push({ term: { flatMeshTrees: settings.meshTree } });
    }

    if (query.bool.must.length === 0) {
        delete query.bool.must;
    }
    return query;
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
    let sort: any = {};
    if (!hasSearchTerm) {
        sort = {
            nihEndorsed: 'desc',
            'primaryNameCopy.raw': 'asc',
        };
    }
    return sort;
}

function generateAggregation(module: string, user: User | undefined, settings: SearchSettingsElastic) {
    const selectedStatuses = settings.selectedStatuses.map(termRegStatus);
    const selectedDatatypes = settings.selectedDatatypes.map(termDatatype);
    const selectedCopyrightStatus = settings.selectedCopyrightStatus.map(termCopyrightStatus);

    const orgs: any = {
        filter: { bool: { filter: [] } },
        aggs: { orgs: { terms: { field: 'classification.stewardOrg.name', size: 500, order: { _key: 'desc' } } } },
    };
    const meshTrees: any = {
        filter: { bool: { filter: [] } },
        aggs: {
            meshTrees: {
                terms: {
                    include: settings.meshTree?.length ? escapeRegExp(settings.meshTree) + ';[^;]+' : '[^;]+',
                    field: 'flatMeshTrees',
                    size: 50,
                },
            },
        },
    };
    const twoLevelMesh: any = {
        filter: { bool: { filter: [] } },
        aggs: {
            twoLevelMesh: {
                terms: {
                    size: 500,
                    field: 'flatMeshTrees',
                    include: '[^;]+;[^;]+',
                },
            },
        },
    };

    const flatClassifications: any = {
        filter: { bool: { filter: [] } },
        aggs: { flatClassifications: { terms: { field: 'flatClassifications', size: 500 } } },
    };
    const flatClassificationsAlt: any = {
        filter: { bool: { filter: [] } },
        aggs: { flatClassificationsAlt: { terms: { field: 'flatClassifications', size: 500 } } },
    };

    const statuses: any = {
        filter: { bool: { filter: [] } },
        aggs: { statuses: { terms: { field: 'registrationState.registrationStatus' } } },
    };
    const datatype: any = {
        filter: { bool: { filter: [] } },
        aggs: { datatype: { terms: { field: 'valueDomain.datatype' } } },
    };
    const copyrightStatus: any = {
        filter: { bool: { filter: [] } },
        aggs: { copyrightStatus: { terms: { field: 'copyrightStatus' } } },
    };
    if (selectedStatuses.length) {
        // allowedStatuses apply on every aggregation filter, include reg status itself
        datatype.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        copyrightStatus.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        orgs.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        meshTrees.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        twoLevelMesh.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        flatClassifications.filter.bool.filter.push({ bool: { should: selectedStatuses } });
        flatClassificationsAlt.filter.bool.filter.push({ bool: { should: selectedStatuses } });
    }
    if (selectedDatatypes.length) {
        statuses.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
        copyrightStatus.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
        orgs.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
        meshTrees.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
        flatClassifications.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
        flatClassificationsAlt.filter.bool.filter.push({ bool: { should: selectedDatatypes } });
    }
    if (module === 'form' && selectedCopyrightStatus.length) {
        statuses.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        datatype.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        orgs.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        meshTrees.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        twoLevelMesh.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        flatClassifications.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
        flatClassificationsAlt.filter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
    }

    const aggregation: any = {
        orgs,
        statuses,
        meshTrees,
        twoLevelMesh,
    };
    if (module === 'cde') {
        aggregation.datatype = datatype;
    }
    if (module === 'form') {
        aggregation.copyrightStatus = copyrightStatus;
    }

    if (settings.selectedOrg && settings.selectedElements) {
        const array = settings.selectedElements.slice(); // use slice() to avoid change original array
        array.unshift(settings.selectedOrg);
        flatClassifications.aggs.flatClassifications.terms.include = escapeRegExp(array.join(';')) + ';[^;]+';
        aggregation.flatClassifications = flatClassifications;
    }

    if (settings.selectedOrgAlt && settings.selectedElementsAlt) {
        const array = settings.selectedElementsAlt.slice(); // use slice() to avoid change original array
        array.unshift(settings.selectedOrgAlt);
        flatClassificationsAlt.aggs.flatClassificationsAlt.terms.include = escapeRegExp(array.join(';')) + ';[^;]+';
        aggregation.flatClassificationsAlt = flatClassificationsAlt;
    }

    return aggregation;
}

function generatePostFilter(user: User | undefined, settings: SearchSettingsElastic) {
    const postFilter: any = { bool: { filter: [] } };
    const selectedStatuses = settings.selectedStatuses.map(termRegStatus);
    const selectedDatatypes = settings.selectedDatatypes.map(termDatatype);
    const selectedCopyrightStatus = settings.selectedCopyrightStatus.map(termCopyrightStatus);
    if (selectedStatuses.length) {
        postFilter.bool.filter.push({ bool: { should: selectedStatuses } });
    }
    if (selectedDatatypes.length) {
        postFilter.bool.filter.push({ bool: { should: selectedDatatypes } });
    }
    if (selectedCopyrightStatus.length) {
        postFilter.bool.filter.push({ bool: { should: selectedCopyrightStatus } });
    }

    return postFilter;
}

function generateHighlight() {
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
