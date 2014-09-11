angular.module('resources')
.factory('MergeCdes', function(DataElement, CDE, CdeClassificationTransfer) {
    var service = this;
    service.approveMergeMessage = function(message) { 
        service.approveMerge(message.typeRequest.source.object, message.typeRequest.destination.object, message.typeRequest.mergeFields, function() {
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
       
        if (fields.ids || fields.properties || fields.naming) {
            exports.transferClassifications(service.source, service.destination);
            DataElement.save(service.destination, function (cde) {
                service.retireSource(service.source, service.destination, function() {
                    if (callback) callback(cde);
                });             
            });
        } else {
            CdeClassificationTransfer.byTinyIds(service.source.tinyId, service.destination.tinyId, callback);
        }
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

    service.retireSource = function(source, destination, cb) {
        CDE.retire(source, function() {
            if (cb) cb();
        });
    }; 
    return service;
})   
.factory('MergeRequest', function(Mail) {
    return {
        create: function(dat, success, error) {              
            var message = {
                recipient: {recipientType: "stewardOrg", name: dat.recipient},
                author: {authorType: "user", name: dat.author},
                date: new Date(),
                type: "Merge Request",
                typeRequest: dat.mergeRequest
            };
            Mail.sendMessage(message, success);
        }
    };
})   
.factory('Mail', function($http) {
    return {
        sendMessage: function(dat, success, error) {              
            $http.post('/mail/messages/new', dat).success(success).error(error);
        },
        getMail: function(type, query, cb) {              
            $http.post("/mail/messages/"+type, query).then(function(response) {
                cb(response.data);
            });
        },
        updateMessage: function(msg, success, error) {
            $http.post('/mail/messages/update', msg).success(success).error(error);
        }
    };        
}) ;