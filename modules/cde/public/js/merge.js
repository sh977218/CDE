import * as classificationShared from "../../../system/shared/classificationShared";

angular.module('CdeMerge', [])
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