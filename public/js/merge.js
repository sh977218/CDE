angular.module('resources').factory('MergeCdes', function(DataElement, Classification, CDE) {
    var service = this;
    service.approveMergeMessage = function(message) { 
        service.approveMerge(message.typeMergeRequest.source.object, message.typeMergeRequest.destination.object, message.typeMergeRequest.fields, function() {
            service.closeMessage(message);
        });
    };
    service.approveMerge = function(source, destination, fields, callback) {
        service.source = source;
        service.destination = destination;
        Object.keys(fields).forEach(function(field) {
            if (fields[field]) {
                service.transferFields(service.source, service.destination, field);
            }
        });
        var classif = function(cde) {
                service.transferClassifications(cde, function() {
                    service.retireSource(service.source, service.destination, function() {
                        if (callback) callback(cde);
                    });                     
                });
            };
        if (fields.ids || fields.properties || fields.naming) DataElement.save(service.destination, classif);
        else classif(service.destination);
    };
    service.transferFields = function(source, destination, type) {
        if (!source[type]) return;
        var fieldsTransfer = this;
        service.alreadyExists = function(obj) {
            delete obj.$$hashKey;
            return destination[type].map(function(obj) {return JSON.stringify(obj)}).indexOf(JSON.stringify(obj))>=0;
        };
        source[type].forEach(function(obj) {            
            if (fieldsTransfer.alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };
    service.transferClassifications = function (target, callback) {
        var classifications = [];
        service.source.classification.forEach(function(stewardOrgClassifications) {
            var orgName = stewardOrgClassifications.stewardOrg.name;
            stewardOrgClassifications.elements.forEach(function(conceptSystem) {
                var conceptSystemName = conceptSystem.name;
                conceptSystem.elements.forEach(function(concept) {
                    var conceptName = concept.name;
                    classifications.push({
                        orgName: orgName
                        , conceptSystem: conceptSystemName                      
                        , concept: conceptName                                
                    });   
                });
            });
        });
        Classification.addListToCde({
            classifications: classifications
            , deId: target._id
        }, callback);
    };
    service.retireSource = function(source, destination, cb) {
        CDE.retire(source, function() {
            if (cb) cb();
        });
    }; 
    return service;
});