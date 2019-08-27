import * as ElasticSearch from 'elasticsearch';
import { config } from '../system/parseConfig';

const boardIndexName = config.elastic.boardIndex.name;

const esClient = new ElasticSearch.Client({
    hosts: config.elastic.hosts
});

export function boardRefresh() {
    return esClient.indices.refresh({index: config.elastic.boardIndex.name});
}

export function updateOrInsertBoardById(id, board, callback) {
    esClient.index({
        index: config.elastic.boardIndex.name,
        type: 'board',
        id: id,
        body: board
    }, callback);
}

export function deleteBoardById(id, callback) {
    esClient.delete({
        index: config.elastic.boardIndex.name,
        type: 'board',
        id: id
    }, callback);
}

export function boardSearch(filter) {
    let query: any = {
        size: 100,
        query: {bool: {must: [{match: {shareStatus: 'Public'}}]}},
        aggs: {
            tagAgg: {terms: {field: 'tags', size: 50}},
            typeAgg: {terms: {field: 'type'}}
        }
    };

    if (filter.search && filter.search.length > 0) {
        query.query.bool.must.push({query_string: {query: filter.search}});
    }
    filter.selectedTypes.forEach(t => {
        if (t !== 'All') {
            query.query.bool.must.push({term: {type: {value: t}}});
        }
    });
    filter.selectedTags.forEach(t => {
        if (t !== 'All') {
            query.query.bool.must.push({term: {tags: {value: t}}});
        }
    });
    return esClient.search({
        index: boardIndexName,
        type: 'board',
        body: query
    });
}

export function myBoards(user, filter) {
    let query: any = {
        size: 100,
        query: {
            bool: {must: [{term: {'owner.username': {value: user.username.toLowerCase()}}}]},
        },
        aggs: {
            typeAgg: {terms: {field: 'type'}},
            tagAgg: {terms: {field: 'tags', size: 50}},
            ssAgg: {terms: {field: 'shareStatus'}}
        },
        sort: []
    };
    let sort = {};
    if (filter.sortBy) {
        sort[filter.sortBy] = {};
        sort[filter.sortBy].order = filter.sortDirection;
    } else {
        sort['updatedDate'] = {order: 'asc'};
        query.sort.push(sort);
    }
    query.sort.push(sort);

    if (filter.selectedTypes) {
        filter.selectedTypes.forEach(t => {
            if (t !== 'All') {
                query.query.bool.must.push({term: {type: {value: t}}});
            }
        });
    }
    if (filter.selectedTags) {
        filter.selectedTags.forEach(t => {
            if (t !== 'All') {
                query.query.bool.must.push({term: {tags: {value: t}}});
            }
        });
    }
    if (filter.selectedShareStatus) {
        filter.selectedShareStatus.forEach(ss => {
            if (ss !== 'All') {
                query.query.bool.must.push({term: {shareStatus: {value: ss}}});
            }
        });
    }
    return esClient.search({
        index: boardIndexName,
        type: 'board',
        body: query
    });
}
