import { config } from 'server/system/parseConfig';
import { createIndexJson as boardCreateIndexJson } from 'server/board/elasticSearchMapping';
import { shortHash } from 'server/system/elasticSearchInit';
import { esClient } from 'server/system/elastic';
import { BoardFilter } from 'shared/board/board.model';
import { Board, CbError, User } from 'shared/models.model';

if (config.elastic.boardIndex.name === 'auto') {
    config.elastic.boardIndex.name = 'board_' + shortHash(boardCreateIndexJson);
}

const boardIndexName = config.elastic.boardIndex.name;

export function boardRefresh() {
    return esClient.indices.refresh({index: config.elastic.boardIndex.name});
}

export function updateOrInsertBoardById(id: string, board: Board, callback: CbError) {
    esClient.index({
        index: config.elastic.boardIndex.name,
        type: '_doc',
        id,
        body: board
    }, callback);
}

export function deleteBoardById(id: string, callback: CbError) {
    esClient.delete({
        index: config.elastic.boardIndex.name,
        id,
    }, callback);
}

export function myBoards(user: User, filter: BoardFilter) {
    const query: any = {
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
    const sort: any = {};
    if (filter.sortBy) {
        sort[filter.sortBy] = {};
        sort[filter.sortBy].order = filter.sortDirection;
    } else {
        sort.updatedDate = {order: 'asc'};
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
        body: query
    });
}
