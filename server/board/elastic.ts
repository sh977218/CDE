import { QueryDslQueryContainer, SortOptions } from '@elastic/elasticsearch/api/types';
import { config } from 'server';
import { createIndexJson as boardCreateIndexJson } from 'server/board/elasticSearchMapping';
import { shortHash } from 'server/system/elasticSearchInit';
import { esClient } from 'server/system/elastic';
import { Board } from 'shared/board.model';
import { BoardFilter } from 'shared/board.model';
import { esqBoolMust, esqTerm } from 'shared/elastic';
import { User } from 'shared/models.model';

if (config.elastic.boardIndex.name === 'auto') {
    config.elastic.boardIndex.name = 'board_' + shortHash(boardCreateIndexJson);
}

const boardIndexName = config.elastic.boardIndex.name;

export function boardRefresh() {
    return esClient.indices.refresh({index: config.elastic.boardIndex.name});
}

export function updateOrInsertBoardById(id: string, board: Omit<Board, '_id'>): Promise<void> {
    return esClient.index({
        index: config.elastic.boardIndex.name,
        type: '_doc',
        id,
        body: board
    }).then();
}

export function deleteBoardById(id: string): Promise<void> {
    return esClient.delete({
        index: config.elastic.boardIndex.name,
        id,
    }).then();
}

export function myBoards(user: User, filter: BoardFilter) {
    const sort: SortOptions = {};
    if (filter.sortBy) {
        sort[filter.sortBy] = {order: filter.sortDirection};
    } else {
        sort.updatedDate = {order: 'asc'};
    }

    const boolMust: QueryDslQueryContainer[] = [
        esqTerm('owner.username', {value: user.username.toLowerCase()})
    ];
    if (filter.selectedTypes) {
        filter.selectedTypes.forEach(t => {
            if (t !== 'All') {
                boolMust.push(esqTerm('type', {value: t}));
            }
        });
    }
    if (filter.selectedTags) {
        filter.selectedTags.forEach(t => {
            if (t !== 'All') {
                boolMust.push(esqTerm('tags', {value: t}));
            }
        });
    }
    if (filter.selectedShareStatus) {
        filter.selectedShareStatus.forEach(ss => {
            if (ss !== 'All') {
                boolMust.push(esqTerm('shareStatus', {value: ss}));
            }
        });
    }

    return esClient.search<Board>({
        index: boardIndexName,
        body: {
            size: 100,
            query: esqBoolMust(boolMust),
            aggs: {
                typeAgg: {terms: {field: 'type'}},
                tagAgg: {terms: {field: 'tags', size: 50}},
                ssAgg: {terms: {field: 'shareStatus'}}
            },
            sort
        }
    });
}
