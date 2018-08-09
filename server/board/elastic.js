const ElasticSearch = require('elasticsearch');
const config = require('../system/parseConfig');
const dbLogger = require('../log/dbLogger.js');
const boardIndexName = config.elastic.boardIndex.name;

const esClient = new ElasticSearch.Client({
    hosts: config.elastic.hosts
});
exports.boardRefresh = function (cb) {
    esClient.indices.refresh({index: config.elastic.boardIndex.name}, cb);
};

exports.updateOrInsertBoardById = (id, board) => {
    esClient.index({
        index: config.elastic.boardIndex.name,
        type: "board",
        id: id,
        body: board
    }, err => {
        if (err) {
            dbLogger.logError({
                message: "Unable to index board: " + id,
                origin: "cde.elastic.boardUpdateOrInsert",
                stack: err,
                details: ""
            });
        }
    });
};

exports.deleteBoardById = id => {
    esClient.delete({
        index: config.elastic.boardIndex.name,
        type: "board",
        id: id
    }, err => {
        if (err) {
            dbLogger.logError({
                message: "Unable to delete board: " + id,
                origin: "cde.elastic.boardDelete",
                stack: err,
                details: ""
            });
        }
    });
};

exports.boardSearch = (filter, callback) => {
    let query = {
        size: 100,
        query: {bool: {must: [{match: {shareStatus: 'Public'}}]}},
        aggs: {
            tagAgg: {terms: {field: "tags", size: 50}},
            typeAgg: {terms: {field: "type"}}
        }
    };

    if (filter.search && filter.search.length > 0) {
        query.query.bool.must.push({match: {_all: filter.search}});
    }
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
    esClient.search({
        index: boardIndexName,
        type: "board",
        body: query
    }, callback);
};

exports.myBoards = (user, filter, callback) => {
    if (!filter) {
        filter = {
            sortDirection: '',
            selectedTags: ['All'],
            selectedTypes: ['All'],
            selectedShareStatus: ['All']
        };
    }
    let query = {
        size: 100,
        query: {
            bool: {must: [{term: {"owner.username": {value: user.username.toLowerCase()}}}]},
        },
        aggs: {
            typeAgg: {terms: {field: "type"}},
            tagAgg: {terms: {field: "tags", size: 50}},
            ssAgg: {terms: {field: "shareStatus"}}
        },
        sort: []
    };
    let sort = {};
    if (filter.sortBy) {
        sort[filter.sortBy] = {};
        if (filter && filter.sortDirection)
            sort[filter.sortBy].order = filter.sortDirection;
        else
            sort[filter.sortBy].order = "asc";
    }
    else {
        sort['updatedDate'] = {"order": "asc"};
        query.sort.push(sort);
    }
    if (filter.boardName) {
        query.query.bool.must.push({
            query_string: {
                fields: ["name"],
                query: filter.booardName
            }
        });
    }
    query.sort.push(sort);

    if (filter.selectedTypes) {
        filter.selectedTypes.forEach(t => {
            if (t !== "All") {
                query.query.bool.must.push({term: {type: {value: t}}});
            }
        });
    }
    if (filter.selectedTags) {
        filter.selectedTags.forEach(t => {
            if (t !== "All") {
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
    esClient.search({
        index: boardIndexName,
        type: "board",
        body: query
    }, callback);
};