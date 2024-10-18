import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { config } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { DataType } from 'shared/de/dataElement.model';
import { SearchSettingsElastic } from 'shared/search/search.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;
const conn = establishConnection(config.database.log);

export interface StoredQuery {
    searchTerm?: string;
    date: Date;
    datatypes: DataType[];
    searchToken?: string;
    username?: string;
    remoteAddr?: string;
    isSiteAdmin?: boolean;
    regStatuses: string[];
    selectedOrg1?: string;
    selectedOrg2?: string;
    selectedElements1: string[];
    selectedElements2: string[];
}

export const storedQuerySchema = new Schema(
    {
        searchTerm: { type: StringType, lowercase: true, trim: true },
        date: { type: Date, default: Date.now },
        searchToken: StringType,
        username: StringType,
        remoteAddr: StringType,
        isSiteAdmin: Boolean,
        regStatuses: [StringType],
        selectedOrg1: StringType,
        selectedOrg2: StringType,
        selectedElements1: [StringType],
        selectedElements2: [StringType],
    },
    { w: 0 } as any
);

const storedQueryModel = conn.model('StoredQuery', storedQuerySchema);

function saveStoredQuery(storedQuery: StoredQuery) {
    new storedQueryModel(storedQuery).save();
}

function findWithSearchToken(searchToken: string | undefined): Promise<(Document & StoredQuery) | null> {
    return storedQueryModel.findOne({ date: { $gt: new Date().getTime() - 30000 }, searchToken });
}

function updateWithSearchToken(searchToken: string | undefined, storedQuery: StoredQuery) {
    return storedQueryModel.findOneAndUpdate({ date: { $gt: new Date().getTime() - 30000 }, searchToken }, storedQuery);
}

export function storeQuery(settings: SearchSettingsElastic) {
    const storedQuery: StoredQuery = {
        datatypes: settings.selectedDatatypes,
        date: new Date(),
        regStatuses: settings.selectedStatuses,
        searchTerm: settings.searchTerm ? settings.searchTerm : '',
        selectedElements1: settings.selectedElements.slice(0),
        selectedElements2: settings.selectedElementsAlt.slice(0),
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
        findWithSearchToken(storedQuery.searchToken).then(theOne => {
            if (theOne) {
                updateWithSearchToken(storedQuery.searchToken, storedQuery);
            } else {
                saveStoredQuery(storedQuery);
            }
        });
    }
}
