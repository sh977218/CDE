const config = require('../system/parseConfig');

exports.createIndexJson = {
    mappings: {
        board: {
            properties: {
                type: {type: "keyword"},
                tags: {type: "keyword"},
                shareStatus: {type: "text", "fielddata": true},
                updatedDate: {type: "date"},
                createdDate: {type: "date"}
            }
        }
    }, settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas
        }
    }
};