import { User } from 'shared/models.model';
import { SearchSettingsElastic } from 'shared/search/search.model';
import { isOrgAuthority } from 'shared/system/authorizationShared';
import { ElasticCondition, getAllowedStatuses, regStatusFilter, termRegStatus } from 'server/system/elastic';

export function buildElasticSearchQuery(user: User, settings: SearchSettingsElastic) {
    function escapeRegExp(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace('<', '');
    }

    function hideRetired() {
        return !settings.includeRetired && settings.selectedStatuses.indexOf('Retired') === -1 || !isOrgAuthority(user);
    }

    const allowedStatuses = getAllowedStatuses(user, settings);

    // Increase ranking score for high registration status
    const script = "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) * doc['classificationBoost'].value";

    // Search for the query term given by user
    const hasSearchTerm = !!settings.searchTerm;

    // last resort, we sort.
    let sort = !hasSearchTerm;

    // (function setFilters() {
    const filterRegStatusTerms = regStatusFilter(user, settings, allowedStatuses);

    const elasticFilter: ElasticCondition['post_filter'] = {
        bool: {
            filter: [
                {bool: {should: filterRegStatusTerms}}
            ]
        }
    };

    settings.filterDatatype = {
        bool: {
            filter: [
                {bool: {should: filterRegStatusTerms}}
            ]
        }
    };

    // Filter by selected Registration Statuses
    const filterStatus = (settings.selectedStatuses || [])
        .map(termRegStatus);
    if (filterStatus.length > 0) {
        elasticFilter.bool.filter.push({bool: {should: filterStatus}});
        settings.filterDatatype.bool.filter.push({bool: {should: filterStatus}})
    }

    // Filter by selected Datatypes
    const filterDatatypeTerms = (settings.selectedDatatypes || [])
        .map(datatype => ({term: {'valueDomain.datatype': datatype}}));
    if (filterDatatypeTerms.length > 0) {
        elasticFilter.bool.filter.push({bool: {should: filterDatatypeTerms}});
    }

    if (hideRetired()) {
        elasticFilter.bool.filter.push({bool: {must_not: termRegStatus('Retired')}});
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
                                        query: hasSearchTerm ? {
                                            query_string: {
                                                analyze_wildcard: true,
                                                default_operator: 'AND',
                                                query: settings.searchTerm
                                            }
                                        } : undefined,
                                        script_score: {script}
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        size: settings.resultPerPage ? (settings.resultPerPage > 100 ? 100 : settings.resultPerPage) : 20
    };

    if (hasSearchTerm) {
        queryStuff.query.bool.must[0].dis_max.queries.push({
            function_score: {
                boost: '2.5',
                query: { // Boost rank if matches are on designation or definition
                    query_string: {
                        fields: ['primaryNameCopy^5', 'primaryDefinitionCopy^2'],
                        analyze_wildcard: true,
                        default_operator: 'AND',
                        query: settings.searchTerm
                    }
                },
                script_score: {script}
            }
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
                            query: '"' + settings.searchTerm + '"~4'
                        }
                    },
                    script_score: {script}
                }
            });
        }
    }

    // Filter by selected org
    if (settings.selectedOrg) {
        queryStuff.query.bool.must.push({term: {'classification.stewardOrg.name': settings.selectedOrg}});
    }
    if (settings.selectedOrgAlt) {
        queryStuff.query.bool.must.push({term: {'classification.stewardOrg.name': settings.selectedOrgAlt}});
    }
    if (settings.excludeAllOrgs) {
        queryStuff.query.bool.must.push({term: {classificationSize: 1}});
    } else {
        if (settings.excludeOrgs && settings.excludeOrgs.length > 0) {
            settings.excludeOrgs.forEach(o => {
                queryStuff.query.bool.must_not = {term: {'classification.stewardOrg.name': o}};
            });
        }
    }

    // filter by topic
    if (settings.meshTree) {
        sort = false;
        // boost for those with fewer mesh trees
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) /" +
                                " (doc['flatMeshTrees'].length + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatMeshTrees: settings.meshTree}});
    }

    const flatSelection = settings.selectedElements ? settings.selectedElements.join(';') : '';
    if (settings.selectedOrg && flatSelection !== '') {
        sort = false;
        // boost for those elts classified fewer times
        queryStuff.query.bool.must.push({
            dis_max: {
                queries: [{
                    function_score: {
                        script_score: {
                            script: "(_score + (6 - doc['registrationState.registrationStatusSortOrder'].value)) /" +
                                " (doc['flatClassifications'].length + 1)"
                        }
                    }
                }]
            }
        });
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrg + ';' + flatSelection}});
    }

    const flatSelectionAlt = settings.selectedElementsAlt ? settings.selectedElementsAlt.join(';') : '';
    if (settings.selectedOrgAlt && flatSelectionAlt !== '') {
        queryStuff.query.bool.must.push({term: {flatClassifications: settings.selectedOrgAlt + ';' + flatSelectionAlt}});
    }

    // show statuses that either you selected, or it's your org and it's not retired.
    const regStatusAggFilter: ElasticCondition = {
        bool: {
            filter: [
                {
                    bool: {
                        should: regStatusFilter(user, settings, allowedStatuses)
                    }
                }
            ]
        }
    };

    if (hideRetired()) {
        regStatusAggFilter.bool.filter.push({bool: {must_not: termRegStatus('Retired')}});
    }

    if (sort) {
        queryStuff.sort = {
            'registrationState.registrationStatusSortOrder': 'asc',
            classificationBoost: 'desc',
            'primaryNameCopy.raw': 'asc'
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
                                _term: 'desc'
                            }
                        }
                    }
                }
            },
            statuses: {
                filter: regStatusAggFilter,
                aggs: {
                    statuses: {
                        terms: {
                            field: 'registrationState.registrationStatus'
                        }
                    }
                }
            }
        };

        const flattenClassificationAggregations = (variableName: string, orgVariableName: string, selectionString: string) => {
            const flatClassifications: ElasticCondition = {
                terms: {
                    size: 500,
                    field: 'flatClassifications'
                }
            };
            if (selectionString === '') {
                flatClassifications.terms.include = escapeRegExp(settings[orgVariableName]) + ';[^;]+';
            } else {
                flatClassifications.terms.include = escapeRegExp(settings[orgVariableName]) + ';'
                    + escapeRegExp(selectionString) + ';[^;]+';
            }
            queryStuff.aggregations[variableName] = {
                filter: elasticFilter,
                aggs: {}
            };
            queryStuff.aggregations[variableName].aggs[variableName] = flatClassifications;
        };
        if (settings.selectedOrg) {
            flattenClassificationAggregations('flatClassifications', 'selectedOrg', flatSelection);
        }
        if (settings.selectedOrgAlt) {
            flattenClassificationAggregations('flatClassificationsAlt', 'selectedOrgAlt', flatSelectionAlt);
        }

        queryStuff.aggregations.meshTrees = {
            filter: elasticFilter,
            aggs: {
                meshTrees: {
                    terms: {
                        size: 50,
                        field: 'flatMeshTrees',
                        include: '[^;]+'
                    }
                }
            }
        };

        if (settings.meshTree && settings.meshTree.length > 0) {
            queryStuff.aggregations.meshTrees.aggs.meshTrees.terms.include = escapeRegExp(settings.meshTree) + ';[^;]+';
        }

        queryStuff.aggregations.twoLevelMesh = {
            filter: elasticFilter,
            aggs: {
                twoLevelMesh: {
                    terms: {
                        size: 500,
                        field: 'flatMeshTrees',
                        // include: '[^;]+'
                        include: '[^;]+;[^;]+'
                    }
                }
            }
        };

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
            primaryDefinitionCopy: {number_of_fragments: 1},
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
