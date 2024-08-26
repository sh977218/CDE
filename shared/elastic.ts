import { ApiResponse } from '@elastic/elasticsearch/api/new';
import {
    AggregationsAggregationContainer,
    AggregationsTermsAggregation, FieldValue, QueryDslBoolQuery,
    QueryDslQueryContainer, QueryDslTermQuery,
    SearchRequest,
    SearchResponse
} from '@elastic/elasticsearch/api/types';

// Aliases
export type ElasticSearchRequestBody = NonNullable<SearchRequest['body']>;
export type ElasticSearchResponse<T> = ApiResponse<T>;
export type ElasticSearchResponseBody<T> = SearchResponse<T>;
export type ElasticSearchResponseAggregations<T> = ElasticSearchResponseBody<T>['aggregations'];


export interface ElasticQueryResponseAggregationBucket {
    checked: boolean;
    key: string;
    doc_count: number;
}

export interface ElasticQueryResponseHit<T> {
    _id: string;
    _index?: string;
    _score: number;
    _source: T;
    _type?: string;
    highlight?: any;
}

export interface ElasticQueryResponseAggregation {
    // 1 or 2 levels of keys followed by buckets
    [key: string]: {
        buckets: ElasticQueryResponseAggregationBucket[];
    } & {
        [key: string]: { buckets: ElasticQueryResponseAggregationBucket[] };
    };
}


export type ElasticQueryError = null
    | {
    status: 406;
    error: string;
}
    | {
    status: 400;
    error: {
        type: 'parsing_exception' | 'search_phase_execution_exception';
        reason: string;
        line?: number;
        col?: number;
        root_cause: {
            type: 'parsing_exception' | 'search_phase_execution_exception';
            reason: string;
            line?: number;
            col?: number;
        }[];
    };
}
    | {
    status: 500;
    error: {
        type: 'json_parse_exception';
        reason: string;
        root_cause: { type: 'json_parse_exception'; reason: string }[];
    };
};

export function responseHitsTotal<T>(res: ElasticSearchResponseBody<T>): number {
    const value = res.hits.total;
    if (value instanceof Object) {
        return value.value;
    }
    return value ?? 0;
}



/*
 * ES Query DSL
 */

export function esqAggregate(name: string, filters: QueryDslQueryContainer[], terms: AggregationsTermsAggregation): AggregationsAggregationContainer {
    return {
        filter: esqBoolFilter(filters),
        aggs: { [name]: { terms: terms } },
    };
}

// # Inputs
// 1. should
// 2. must
// 3. filter
// 4. must_not
export function esqBool(
    should: QueryDslQueryContainer | QueryDslQueryContainer[] | null,
    must?: QueryDslQueryContainer | QueryDslQueryContainer[] | null,
    filter?: QueryDslQueryContainer | QueryDslQueryContainer[] | null,
    mustNot?: QueryDslQueryContainer | QueryDslQueryContainer[]
): QueryDslQueryContainer {
    const boolQuery: QueryDslBoolQuery = {};
    if (filter) {
        boolQuery.filter = filter;
    }
    if (must) {
        boolQuery.must = must;
    }
    if (mustNot) {
        boolQuery.must_not = mustNot;
    }
    if (should) {
        boolQuery.should = should;
    }
    return {bool: boolQuery};
}

// does not score, only excludes
export function esqBoolFilter(query: QueryDslQueryContainer | QueryDslQueryContainer[]): QueryDslQueryContainer {
    return { bool: { filter: query}}
}

// AND operation on queriesAND input
export function esqBoolMust(queriesAND: QueryDslQueryContainer | QueryDslQueryContainer[]): QueryDslQueryContainer {
    return { bool: { must: queriesAND } };
}

// does not score, only excludes
export function esqBoolMustNot(query: QueryDslQueryContainer | QueryDslQueryContainer[]): QueryDslQueryContainer {
    return { bool: { must_not: query } };
}

// OR operation on queriesOR input
export function esqBoolShould(queriesOR: QueryDslQueryContainer | QueryDslQueryContainer[]): QueryDslQueryContainer {
    return { bool: { should: queriesOR } };
}

// "text" search: exact match including capitalization and punctuation (alternatively for analyzed search use "match")
export function esqTerm(key: string, value: QueryDslTermQuery | FieldValue): QueryDslQueryContainer {
    return { term: { [key]: value } };
}
