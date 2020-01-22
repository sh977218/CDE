import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import { config } from '../system/parseConfig';
import { handleError } from 'server/errorHandler/errorHandler';
import { CbError } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.log);

export const storedQuerySchema = new Schema({
    searchTerm: {type: StringType, lowercase: true, trim: true},
    date: {type: Date, default: Date.now},
    searchToken: StringType,
    username: StringType,
    remoteAddr: StringType,
    isSiteAdmin: Boolean,
    regStatuses: [StringType],
    selectedOrg1: StringType,
    selectedOrg2: StringType,
    selectedElements1: [StringType],
    selectedElements2: [StringType]
}, {w: 0} as any);

const storedQueryModel = conn.model('StoredQuery', storedQuerySchema);

function saveStoredQuery(storedQuery, callback) {
    new storedQueryModel(storedQuery).save(callback);
}

function findWithSearchToken(searchToken, callback) {
    storedQueryModel.findOne({date: {$gt: new Date().getTime() - 30000}, searchToken}, callback);
}

function updateWithSearchToken(searchToken, storedQuery, callback) {
    storedQueryModel.findOneAndUpdate({date: {$gt: new Date().getTime() - 30000}, searchToken},
        storedQuery, callback);
}

export function storeQuery(settings, callback?: CbError) {
    const storedQuery: any = {
        datatypes: settings.selectedDatatypes,
        date: new Date(),
        regStatuses: settings.selectedStatuses,
        searchTerm: settings.searchTerm ? settings.searchTerm : '',
        selectedElements1: settings.selectedElements.slice(0),
        selectedElements2: settings.selectedElementsAlt.slice(0)
    };
    if (settings.selectedOrg) {
        storedQuery.selectedOrg1 = settings.selectedOrg;
    }
    if (settings.selectedOrgAlt) {
        storedQuery.selectedOrg2 = settings.selectedOrgAlt;
    }
    if (settings.searchToken) {
        storedQuery.searchToken = settings.searchToken;
    }

    if (!(!storedQuery.selectedOrg1 && storedQuery.searchTerm === '')) {
        findWithSearchToken(storedQuery.searchToken, (err, theOne) => {
            if (theOne) {
                updateWithSearchToken(storedQuery.searchToken, storedQuery,
                    handleError({}, () => {
                    }));
            } else {
                saveStoredQuery(storedQuery, callback);
            }
        });
    }
}
