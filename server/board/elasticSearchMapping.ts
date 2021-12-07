import { config } from 'server/config'; // gulpfile: cannot use 'server' because it connects to db

export const createIndexJson = {
    mappings: {
        properties: {
            type: {type: 'keyword'},
            tags: {type: 'keyword'},
            shareStatus: {type: 'keyword'},
            updatedDate: {type: 'date'},
            createdDate: {type: 'date'}
        }
    }, settings: {
        index: {
            number_of_replicas: config.elastic.number_of_replicas
        }
    }
};
