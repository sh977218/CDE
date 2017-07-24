angular.module('resourcesCde', ['ngResource'])
    .factory('BoardSearch', ["$resource", function ($resource) {
        return $resource('/listboards');
    }])
    .factory('DataElement', ["$resource", function ($resource) {
        return $resource('/dataElement/tinyId/:tinyId', {deId: '@tinyId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    }])
    .factory('DataElementTinyId', ["$resource", function ($resource) {
        return $resource('/dataElement/:tinyId/:version', {tinyId: 'tinyId', version: '@version'});
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
    .factory("LinkToVsac", ["$resource", function ($resource) {
        return $resource(
            "/linktovsac",
            {cde_id: '@cde_id', vs_id: '@vs_id'},
            {link: {method: 'POST'}}
        );
    }])
    .factory('CdesForApproval', ["$resource", function ($resource) {
        return $resource('/cdesforapproval');
    }])
    .factory('CDE', ["$http", function ($http) {
        return {
            retire: function (cdeSrc, cdeDes, cb) {
                $http.post("/retireCde", {cde: cdeSrc, merge: cdeDes}).then(function (response) {
                    cb(response.data);
                });
            }
        };
    }])
;
