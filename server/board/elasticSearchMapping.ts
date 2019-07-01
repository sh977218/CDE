import { config } from '../system/parseConfig';

export const createIndexJson = {
    mappings: {
        board: {
            properties: {
                type: {type: "keyword"},
                tags: {type: "keyword"},
                shareStatus: {type: "keyword"},
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
