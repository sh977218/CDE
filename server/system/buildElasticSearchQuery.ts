import {
    ElasticCondition,
    getAllowedStatuses,
    regStatusFilter,
    termCopyrightStatus,
    termDatatype,
    termRegStatus,
} from 'server/system/elastic';
import { User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { isOrgAuthority } from 'shared/security/authorizationShared';

const endorsedBoost: string = '1.2';

function escapeRegExp(str: string) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace('<', '');
}

function hideRetired(settings: SearchSettingsElastic, user?: User) {
    return (!settings.includeRetired && settings.selectedStatuses.indexOf('Retired') === -1) || !isOrgAuthority(user);
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
    // Increase ranking score for high registration status
    //    const script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    const script = `
    if (doc['nihEndorsed'].value == true) { return _score * ${endorsedBoost} } else return _score
    `;

    // Search for the query term given by user
    // ElasticSearch Reserved Characters(some are used by power users): + - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /
    settings.searchTerm = settings.searchTerm?.replace(/(?<=[^\\])\//g, '\\/'); // escape /
    const hasSearchTerm = !!settings.searchTerm;
    // last resort, we sort.

    const sort = !hasSearchTerm;
    // (function setFilters() {

    const filterRegStatusTerms = regStatusFilter(user, settings);

    const elasticFilter: ElasticCondition['post_filter'] = {
        bool: {
            filter: [{ bool: { should: filterRegStatusTerms } }],
        },
    };

    settings.filterDatatype = {
        bool: {
            filter: [{ bool: { should: filterRegStatusTerms } }],
        },
    };
    settings.filterCopyrightStatus = {
        bool: {
            filter: [{ bool: { should: filterRegStatusTerms } }],
        },
    };

    // Filter by selected Registration Statuses
    const filterStatus = (settings.selectedStatuses || []).map(termRegStatus);
    if (filterStatus.length > 0) {
        elasticFilter.bool.filter.push({ bool: { should: filterStatus } });
        settings.filterDatatype.bool.filter.push({ bool: { should: filterStatus } });
        settings.filterCopyrightStatus.bool.filter.push({ bool: { should: filterStatus } });
    }

    // Filter by selected copyrightStatus
    const filterCopyrightStatusTerms = (settings.selectedCopyrightStatus || []).map(termCopyrightStatus);
    if (filterCopyrightStatusTerms.length > 0) {
        elasticFilter.bool.filter.push({ bool: { should: filterCopyrightStatusTerms } });
    }

    // Filter by selected Datatypes
    const filterDatatypeTerms = (settings.selectedDatatypes || []).map(termDatatype);
    if (filterDatatypeTerms.length > 0) {
        elasticFilter.bool.filter.push({ bool: { should: filterDatatypeTerms } });
    }

    // Filter by NIH Endorsed
    /*
        const filterNihEndorsedTerms = {term: {nihEndorsed: true}}
        if (settings.nihEndorsed) {
            elasticFilter.bool.filter.push({bool: {should: filterNihEndorsedTerms}});
        }
    */

    if (hideRetired(settings, user)) {
        elasticFilter.bool.filter.push({ bool: { must_not: termRegStatus('Retired') } });
    }

    const queryStuff: ElasticCondition = {
        post_filter: elasticFilter,
        query: {
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
            },
        },
        size: settings.resultPerPage ? (settings.resultPerPage > 100 ? 100 : settings.resultPerPage) : 20,
    };
    if (settings.nihEndorsed) {
        queryStuff.query.bool.must.push({ term: { nihEndorsed: true } });
    }

    if (hasSearchTerm) {
        queryStuff.query.bool.must[0].dis_max.queries.push({
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
            queryStuff.query.bool.must[0].dis_max.queries[1].function_score.boost = '2';
            queryStuff.query.bool.must[0].dis_max.queries.push({
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

    // Filter by selected org
    if (settings.selectedOrg) {
        queryStuff.query.bool.must.push({ term: { 'classification.stewardOrg.name': settings.selectedOrg } });
    }
    if (settings.selectedOrgAlt) {
        queryStuff.query.bool.must.push({ term: { 'classification.stewardOrg.name': settings.selectedOrgAlt } });
    }
    if (settings.excludeAllOrgs) {
        queryStuff.query.bool.must.push({ term: { classificationSize: 1 } });
    } else {
        if (settings.excludeOrgs && settings.excludeOrgs.length > 0) {
            settings.excludeOrgs.forEach(o => {
                queryStuff.query.bool.must_not = { term: { 'classification.stewardOrg.name': o } };
            });
        }
    }
    const flatSelection = settings.selectedElements ? settings.selectedElements.join(';') : '';
    if (settings.selectedOrg && flatSelection !== '') {
        queryStuff.query.bool.must.push({ term: { flatClassifications: settings.selectedOrg + ';' + flatSelection } });
    }
    const flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(';') : '';
    if (settings.selectedOrgAlt && flatSelectionAlt !== '') {
        queryStuff.query.bool.must.push({
            term: { flatClassifications: settings.selectedOrgAlt + ';' + flatSelectionAlt },
        });
    }
    // show statuses that either you selected, or it's your org and it's not retired.
    const regStatusAggFilter: ElasticCondition = {
        bool: {
            filter: [
                {
                    bool: {
                        should: regStatusFilter(user, settings),
                    },
                },
            ],
        },
    };
    // show NIH Endorsed aggregation
    const nihEndorsedAggFilter: ElasticCondition = {
        bool: {
            filter: [
                {
                    term: {
                        nihEndorsed: true,
                    },
                },
            ],
        },
    };
    if (hideRetired(settings, user)) {
        regStatusAggFilter.bool.filter.push({ bool: { must_not: termRegStatus('Retired') } });
    }
    if (sort) {
        queryStuff.sort = {
            'registrationState.registrationStatusSortOrder': 'asc',
            classificationBoost: 'desc',
            'primaryNameCopy.raw': 'asc',
        };
    }

    if (sort) {
        queryStuff.sort = {
            nihEndorsed: 'desc',
            'primaryNameCopy.raw': 'asc',
        };
    }

    // Get aggregations on classifications and statuses
    if (settings.includeAggregations) {
        queryStuff.aggregations = {
            orgs: {
                filter: elasticFilter,
                aggs: {
                    orgs: {
                        terms: {
                            field: 'classification.stewardOrg.name',
                            size: 500,
                            order: {
                                _term: 'desc',
                            },
                        },
                    },
                },
            },
            statuses: {
                filter: elasticFilter,
                aggs: {
                    statuses: {
                        terms: {
                            field: 'registrationState.registrationStatus',
                        },
                    },
                },
            },
            nihEndorsed: {
                filter: nihEndorsedAggFilter,
                aggs: {
                    nihEndorsed: {
                        terms: {
                            field: 'nihEndorsed',
                        },
                    },
                },
            },
        };
        const flattenClassificationAggregations = (
            variableName: string,
            orgVariableName: string,
            selectionString: string
        ) => {
            const flatClassifications: ElasticCondition = {
                terms: {
                    size: 500,
                    field: 'flatClassifications',
                },
            };
            if (selectionString === '') {
                flatClassifications.terms.include = escapeRegExp(settings[orgVariableName]) + ';[^;]+';
            } else {
                flatClassifications.terms.include =
                    escapeRegExp(settings[orgVariableName]) + ';' + escapeRegExp(selectionString) + ';[^;]+';
            }
            queryStuff.aggregations[variableName] = {
                filter: elasticFilter,
                aggs: {},
            };
            queryStuff.aggregations[variableName].aggs[variableName] = flatClassifications;
        };
        if (settings.selectedOrg) {
            flattenClassificationAggregations('flatClassifications', 'selectedOrg', flatSelection);
        }
        if (settings.selectedOrgAlt) {
            flattenClassificationAggregations('flatClassificationsAlt', 'selectedOrgAlt', flatSelectionAlt);
        }
    }
    if (queryStuff.query.bool.must.length === 0) {
        delete queryStuff.query.bool.must;
    }
    queryStuff.from = ((settings.page || 0) - 1) * settings.resultPerPage;
    if (!queryStuff.from || queryStuff.from < 0) {
        queryStuff.from = 0;
    }
    // highlight search results if part of the following fields.
    queryStuff.highlight = {
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
    return queryStuff;
}
