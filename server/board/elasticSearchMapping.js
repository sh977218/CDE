const config = require('../system/parseConfig');

exports.createIndexJson = {
    mappings: {
        board: {
            properties: {
                type: {type: "string", "index": "not_analyzed"},
                tags: {type: "string", index: "not_analyzed"},
                shareStatus: {type: "string", index: "not_analyzed"},
                updatedDate: {type: "date", index: "not_analyzed"},
                createdDate: {type: "date", index: "not_analyzed"}
            }
        }
    }, settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas
        }
    }
};