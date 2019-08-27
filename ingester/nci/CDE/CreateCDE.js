import { BATCHLOADER } from 'ingester/shared/utility';

const _ = require('lodash');

const generateTinyId = require('../../../server/system/mongo-data').generateTinyId;

const ParseDesignations = require('../Shared/ParseDesignations');
const ParseDefinitions = require('../Shared/ParseDefinitions');
const ParseSources = require('../Shared/ParseSources');
const ParseOrigin = require('../Shared/ParseOrigin');
const ParseIds = require('../Shared/ParseIds');
const ParseRegistrationState = require('../Shared/ParseRegistrationState');
const ParseProperties = require('../Shared/ParseProperties');
const ParseAttachments = require('../Shared/ParseAttachments');
const ParseReferenceDocuments = require('../Shared/ParseReferenceDocuments');
const ParseClassification = require('../Shared/ParseClassification');

const ParseValueDomain = require('./ParseValueDomain');
const ParseDataElementConcept = require('./ParseDataElementConcept');
const ParseObjectClass = require('./ParseObjectClass');
const ParseProperty = require('./ParseProperty');

const today = new Date().toJSON();

import { checkPvUnicity } from 'shared/de/deValidator';

exports.createCde = async (nciCde, orgInfo) => {
    let designations = ParseDesignations.parseDesignations(nciCde);
    let definitions = ParseDefinitions.parseDefinitions(nciCde);
    let registrationState = ParseRegistrationState.parseRegistrationState(nciCde);
    let sources = await ParseSources.parseSources(nciCde);
    let origin = ParseOrigin.parseOrigin(nciCde);
    let ids = ParseIds.parseIds(nciCde);
    let properties = ParseProperties.parseProperties(nciCde);
    let attachments = await ParseAttachments.parseAttachments(nciCde);
    let referenceDocuments = ParseReferenceDocuments.parseReferenceDocuments(nciCde);

    let valueDomain = ParseValueDomain.parseValueDomain(nciCde);
    let objectClass = ParseObjectClass.parseObjectClass(nciCde);
    let property = ParseProperty.parseProperty(nciCde);
    let dataElementConcept = ParseDataElementConcept.parseDataElementConcept(nciCde);

    let cde = {
        tinyId: generateTinyId(),
        imported: today,
        created: today,
        createdBy: BATCHLOADER,
        registrationState: registrationState,
        sources: sources,
        source: 'caDSR',
        origin: origin,
        version: nciCde.VERSION[0],
        designations: designations,
        definitions: definitions,
        valueDomain: valueDomain,
        stewardOrg: {name: orgInfo['stewardOrgName']},
        ids: ids,
        attachments: attachments,
        properties: properties,
        referenceDocuments: referenceDocuments,
        objectClass: objectClass,
        property: property,
        dataElementConcept: dataElementConcept,
        classification: [],
        comments:[]
    };

    ParseClassification.parseClassification(nciCde,cde, orgInfo);

    let cdeError = checkPvUnicity(cde.valueDomain);
    if (cdeError && !cdeError.allValid) {
        if (cdeError.message.indexOf('Duplicate Code Name:') !== -1){
            let uniqPvs = _.uniqBy(cde.valueDomain.permissibleValues,'valueMeaningName');
            cde.valueDomain.permissibleValues = uniqPvs;
            let comment  = {
                text: cdeError.message +'. See attachment for original xml.',
                user: BATCHLOADER,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'pvs',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'cde',
                }
            };
            cde.comments.push(comment);
        } else if (cdeError.message.indexOf('Duplicate Code:') !== -1){
            let uniqPvs = _.uniqBy(cde.valueDomain.permissibleValues,'valueMeaningCode');
            cde.valueDomain.permissibleValues = uniqPvs;
            let comment = {
                text: cdeError.message +'. See attachment for original xml.',
                user: BATCHLOADER,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'pvs',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'cde',
                }
            };
            cde.comments.push(comment);
        } else {
            console.log('some other cde error.');
            process.exit(1);
        }
    }
    return cde;
};