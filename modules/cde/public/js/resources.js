angular.module('resourcesCde', ['ngResource'])
    .factory('DataElement', ["$resource", function ($resource) {
        return $resource('/de/:tinyId', {deId: '@tinyId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    }])
    .factory('CdeList', ["$http", function ($http) {
        return {
            byTinyIdList: function (ids, cb) {
                $http.post("/cdesByTinyIdList", ids).then(function (response) {
                    cb(response.data);
                }, function (err) {});
            }
        };
    }])
    .factory('ElasticBoard', ["$http", function ($http) {
        return {
            loadMyBoards: function (filter, cb) {
                $http.post('/myBoards', filter).then(function onSuccess(response) {
                    if (cb) cb(response.data);
                }).catch(function onError() {
                    if (cb) cb("Unable to retrieve my boards");
                });
            },
            basicSearch: function (filter, cb) {
                $http.post("/boardSearch", filter).then(function onSuccess(response) {
                    if (cb) cb(null, response.data);
                }).catch(function onError(response) {
                    if (cb) cb("Unable to retrieve public boards - " + response.data);
                });
            }
        };
    }])
    .factory('CdeDiff', ["$resource", function ($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'}, {get: {isArray: true}});
    }])
    .factory('CDE', ["$http", function ($http) {
        return {
            retire: function (cdeSrc, cdeDes, cb) {
                $http.post("/retireCde", {cde: cdeSrc, merge: cdeDes}).then(function (response) {
                    cb(response);
                });
            }
        };
    }])
;
