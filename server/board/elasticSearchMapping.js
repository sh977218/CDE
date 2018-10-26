const config = require('../system/parseConfig');

exports.createIndexJson = {
    mappings: {
        board: {
            properties: {
                type: {type: "keyword"},
                tags: {type: "keyword"},
                shareStatus: {type: "text", "fielddata": true},
                updatedDate: {"enabled": false},
                createdDate: {"enabled": false}
            }
        }
    }, settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas
        }
    }
};