import * as classificationShared from "../../../system/shared/classificationShared";

angular.module('CdeMerge', [])
.factory('MergeCdes', ['$http', 'DataElement', 'CDE', 'CdeClassificationTransfer', function($http, DataElement, CDE, CdeClassificationTransfer) {
    var service = this;
    service.approveMergeMessage = function(message) { 
        service.approveMerge(message.typeRequest.source.object, message.typeRequest.destination.object, message.typeRequest.mergeFields, function() {
            service.closeMessage(message);
        });
    };
    service.approveMerge = function(source, destination, fields, callback) {
        $http.get('/deByTinyId/' + source.tinyId).then(function (result) {
            service.source = result.data;
            return $http.get('/deByTinyId/' + destination.tinyId);
        }).then(function (result) {
            service.destination = result.data;
            Object.keys(fields).forEach(function(field) {
                if (fields[field]) {
                    service.transferFields(service.source, service.destination, field);
                }
            });

            if (fields.ids || fields.properties || fields.naming) {
                classificationShared.transferClassifications(service.source, service.destination);
                DataElement.save(service.destination, function (cde) {
                    service.retireSource(service.source, service.destination, function() {
                        if (callback) callback(cde);
                    });
                });
            } else {
                CdeClassificationTransfer.byTinyIds(service.source.tinyId, service.destination.tinyId, callback);
            }
        });
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
        CDE.retire(source, destination, function () {
            if (cb) cb();
        });
    }; 
    return service;
}])
.factory('MergeRequest', ['Mail', function(Mail) {
    return {
        create: function(dat, success, error) {              
            var message = {
                recipient: {recipientType: "stewardOrg", name: dat.recipient},
                author: {authorType: "user", name: dat.author},
                date: new Date(),
                type: "MergeRequest",
                typeRequest: dat.mergeRequest
            };
            Mail.sendMessage(message, success, error);
        }
    };
}])
.factory('Mail', ["$http", function($http) {
    return {
        sendMessage: function(dat, success, error) {              
            $http.post('/mail/messages/new', dat).then(function onSuccess(response) {
                success(response.data)
            }, function onError(response) {
                error(response.data)
            });
        },
        getMail: function(type, query, cb) {
            $http.post("/mail/messages/" + type, query).then(function(response) {
                cb(response.data);
            });
        },
        updateMessage: function(msg, success, error) {
            $http.post('/mail/messages/update', msg).then(function onSuccess(response) {
                success(response.data)
            }, function onError(response) {
                error(response.data)
            });
        }
    };        
}]);