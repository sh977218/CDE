import * as classificationShared from "../../../system/shared/classificationShared";

angular.module('CdeMerge', [])
    .factory('MergeCdes', ['$http', 'DataElement', 'CDE', 'CdeClassificationTransfer', function ($http, DataElement, CDE, CdeClassificationTransfer) {
        var service = this;
        service.approveMergeMessage = function (message) {
            service.approveMerge(message.typeRequest.source.object, message.typeRequest.destination.object, message.typeRequest.mergeFields, function () {
                service.closeMessage(message);
            });
        };


        service.retireSource = function (source, destination, cb) {
            CDE.retire(source, destination, function (response) {
                if (cb) cb(response);
            });
        };
        return service;
    }])
    .factory('MergeRequest', ['Mail', function (Mail) {
        return {
            create: function (dat, success, error) {
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
    .factory('Mail', ["$http", function ($http) {
        return {
            sendMessage: function (dat, success, error) {
                $http.post('/mail/messages/new', dat).then(function onSuccess(response) {
                    success(response.data);
                }, function onError(response) {
                    error(response.data);
                });
            }, getMail: function (type, query, cb) {
                $http.post("/mail/messages/" + type, query).then(function (response) {
                    cb(response.data);
                });
            }
        };
    }]);