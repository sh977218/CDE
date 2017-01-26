var mongo_data = require('./mongo-cde');

var sdcExport = function(req, res, cde) {

    var sdcRecord = {
        scopedIdentifier: "cde.nlm.nih.gov/" + cde.tinyId + "/" + cde.version
        , identifier: cde.tinyId
        , version: cde.version
        , name: cde.naming[0].designation
        , definition: cde.naming[0].definition
        , context: cde.stewardOrg.name
        , registrationStatus: cde.registrationState.registrationStatus
        , creationDate: cde.created
        , lastChangeDate: cde.updated
        , submittingOrganization: ''
        , stewardOrganization: {name: cde.stewardOrg.name, contactName: ''}
        , registrationOrganization: ''
        , valueDomain: {name: cde.valueDomain.name}
        , origin: cde.origin
        , valueSet: {id: cde.valueDomain.vsacOid, name: "see vsac", administrativeStatus: "see vsac", lastChangeDate: "see vsac"}
    };
    for (var i = 0; i < cde.naming.length; i++) {
        try {
            if (!sdcRecord.preferredQuestionText && cde.naming[i].tags.filter(function (t) {
                    return t.tag.toLowerCase() === "preferred question text"
                }).length > 0) {
                sdcRecord.preferredQuestionText = cde.naming[i].designation;
            }
            if (!sdcRecord.alternateQuestionText && cde.naming[i].tags.filter(function (t) {
                    return t.tag.toLowerCase() === "alternate question text"
                }).length > 0) {
                sdcRecord.alternateQuestionText = cde.naming[i].designation;
            }
        } catch (e) {
            // ignore error. 
        }
    }
    if (!sdcRecord.preferredQuestionText) {
        cde.naming.forEach(function(n) {
            try {
                if (!sdcRecord.preferredQuestionText && n.context.contextName.toLowerCase() === "question text") {
                    sdcRecord.preferredQuestionText = n.designation;
                }
            } catch (e) {
                // ignore error
            }
        });
    }
    if (!sdcRecord.preferredQuestionText) {
        sdcRecord.preferredQuestionText = cde.naming[0].designation;
    }
    if (cde.dataElementConcept.concepts.length > 0) {
        sdcRecord.dataElementConcept = {concept: cde.dataElementConcept.concepts[0].name};
    }
    if (cde.registrationState.administrativeStatus) {
        sdcRecord.administrativeStatus = cde.registrationState.administrativeStatus;
    }
    if (cde.valueDomain.datatype !== 'Value List') {
        sdcRecord.valueDomain.datatype = cde.valueDomain.datatype;
        sdcRecord.valueDomain.type = 'described';
    } else {
        sdcRecord.valueDomain.datatype = cde.valueDomain.datatypeValueList.datatype;
        sdcRecord.valueDomain.type = 'enumerated';
    }
    sdcRecord.valueDomain.unitOfMeasure = cde.valueDomain.uom;
    return res.send(sdcRecord);
};

exports.byId = function (req, res) {
    mongo_data.byId(req.params.id, function(err, cde) {
        if (err) return res.status(500).send("Error");
        if (!cde) return res.status(404).send("No such Element");
        sdcExport(req, res, cde); 
    });
};

exports.byTinyIdVersion = function (req, res) {
    mongo_data.byTinyIdAndVersion(req.params.tinyId, req.params.version, function(err, cde) {
        if (err) return res.status(500).send("Error");
        if (!cde) return res.status(404).send("No such Element");
        sdcExport(req, res, cde); 
    });
};