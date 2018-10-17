const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseIds = require('../Shared/ParseIds');
const ParseProperties = require('../Shared/ParseProperties');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseValueDomain = require('./ParseValueDomain');
const today = new Date().toJSON();

exports.createCde = nciCde => {
    return new Promise((resolve, reject) => {
        let designations = ParseDesignations.parseDesignations(nciCde);
        let definitions = ParseDefinitions.parseDefinitions(nciCde);
        let ids = ParseIds.parseIds(nciCde);
        let properties = ParseProperties.parseProperties(nciCde);
        let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(nciCde);
        let valueDomain = ParseValueDomain.parseValueDomain(nciCde);
        resolve();
    })

};