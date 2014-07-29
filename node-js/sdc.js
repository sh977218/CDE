var mongo_data = require('./mongo-data');


exports.byUuidVersion = function (req, res, cb) {
    mongo_data.deByUuidAndVersion(req.params.uuid, req.params.version, function(err, cde) {
        if (err) {
            return res.send(500, "Error");
        };
        if (!cde) {
            return res.send(404, "No such Element");
        };
        var sdcRecord = {
            scopeIdentifier: "cde.nlm.nih.gov/" + cde.uuid + "/" + cde.version
            , identifier: cde.uuid
            , version: cde.version
            , name: cde.naming[0].designation
            , definition: cde.naming[0].definition
            , context: cde.stewardOrg.name
            , registrationStatus: cde.registrationState.registrationStatus
            , creationDate: cde.created
            , lastChangeDate: cde.updated
            , submittingOrganization: 'N/A'
            , stewardOrganization: {name: cde.stewardOrg.name, contactName: 'N/A'}
            , registrationOrganization: 'N/A'
            , valueDomain: {}
            , valueSet: {id: cde.valueDomain.vsacOid, name: "see vsac", administrativeStatus: "see vsac", lastChangeDate: "see vsac"}
        };
        sdcRecord.preferredQuestionText = "TODO";
        sdcRecord.alternativeQuestionText = "TODO";
        if (cde.dataElementConcept.concepts.length > 0) {
            sdcRecord.dataElementConcept = {concept: cde.dataElementConcept.concepts[0].name};
        }
        if (cde.registrationState.administrativeStatus) {
            sdcRecord.administrativeStatus = cde.registrationState.administrativeStatus;
        }
        if (cde.valueDomain.datatype !== 'Value List') {
            sdcRecord.valueDomain.datatype = cde.valueDomain.datatype;
            sdcRecord.valueDomain.type = 'enumerated';
        } else {
            sdcRecord.valueDomain.datatype = cde.valueDomain.datatypeValueList.datatype;
            sdcRecord.valueDomain.type = 'non-enumerated';
        }
        sdcRecord.valueDomain.unitOfMeasure = cde.valueDomain.uom;
        if (req.query.pretty !== null && req.query.pretty === "true") {      
            // TODO - don't know how to do this ...
            return res.send(sdcRecord);            
        } else {
            return res.send(sdcRecord);
        }
    });
};