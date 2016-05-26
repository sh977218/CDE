angular.module('resourcesCde', ['ngResource'])
    .factory('BoardSearch', function ($resource) {
        return $resource('/listboards');
    })
    .factory('DataElement', function ($resource) {
        return $resource('/dataelement/:deId', {deId: '@deId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    })
    .factory('DataElementTinyId', function ($resource) {
        return $resource('/debytinyid/:tinyId/:version', {tinyId: 'tinyId', version: '@version'});
    })
    .factory('CdeList', function ($http) {
        return {
            byTinyIdList: function (ids, cb) {
                $http.post("/cdesByTinyIdList", ids).then(function (response) {
                    cb(response.data);
                });
            }
        };
    })
    .factory('ElasticBoard', function ($http) {
        return {
            loadMyBoards: function (filter, cb) {
                $http.post('/myBoards', filter).success(function (response) {
                    if (cb) cb(response);
                }).error(function () {
                    if (cb) cb("Unable to retrieve my boards");
                });
            },
            basicSearch: function (filter, cb) {
                $http.post("/boardSearch", filter).success(function (response) {
                    if (cb) cb(response);
                }).error(function () {
                    if (cb) cb("Unable to retrieve public boards");
                });
            }
        };
    })
    .factory('PriorCdes', function ($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'},
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdeDiff', function ($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'}, {get: {isArray: true}});
    })
    .factory("LinkToVsac", function ($resource) {
        return $resource(
            "/linktovsac",
            {cde_id: '@cde_id', vs_id: '@vs_id'},
            {link: {method: 'POST'}}
        );
    })
    .factory('CdesForApproval', function ($resource) {
        return $resource('/cdesforapproval');
    })
    .factory('Board', function ($resource) {
        return $resource('/board/:id/:start', {id: '@id', start: '@start'},
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CDE', function ($http) {
        return {
            retire: function (cde, cb) {
                $http.post("/retireCde", cde).then(function (response) {
                    cb(response.data);
                });
            }
        };
    })
    .directive('ngVersionAvailable', ['$http', function ($http) {
        return {
            require: 'ngModel',
            link: function (scope, ele, attrs, ctrl) {
                var url;
                scope.$watch(attrs.ngModel, function () {
                    var lastVersion = scope.elt.version;
                    if (scope.elt.formElements) {
                        url = '/formbytinyid/' + scope.elt.tinyId + "/" + scope.elt.version;
                    } else {
                        url = '/deExists/' + scope.elt.tinyId + "/" + scope.elt.version
                    }
                    $http({
                        method: 'GET',
                        url: url
                    }).success(function (data) {
                        if (lastVersion !== scope.elt.version) return;
                        ctrl.$setValidity('unique', !data);
                    }).error(function () {
                        if (lastVersion !== scope.elt.version) return;
                        ctrl.$setValidity('unique', false);
                    });
                });
            }
        };
    }]);
