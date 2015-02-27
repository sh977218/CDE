angular.module('resourcesCde', ['ngResource'])
    .factory('BoardSearch', function($resource) {
        return $resource('/listboards');
    })
    .factory('DataElement', function($resource) {
        return $resource('/dataelement/:deId', {deId: '@deId'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
    })
    .factory('DataElementTinyId', function($resource) {
        return $resource('/debytinyid/:tinyId/:version', {tinyId: 'tinyId', version: '@version'});
    })
    .factory('CdeList', function($http) {
        return {
            byTinyIdList: function(ids, cb) {              
                $http.post("/cdesByTinyIdList", ids).then(function(response) {
                    cb(response.data);
                });
            }
        }; 
    })    
    .factory('PriorCdes', function($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdeDiff', function($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'});
    })           
    .factory("LinkToVsac", function($resource) {
        return $resource(
                "/linktovsac", 
                {cde_id: '@cde_id', vs_id: '@vs_id'}, 
                {link: {method: 'POST'}}
            );
    })
    .factory('CdesForApproval', function($resource) {
        return $resource('/cdesforapproval');
    })
    .factory('Board', function($resource) {
        return $resource('/board/:id/:start', {id: '@id', start: '@start'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CDE', function($http) {
        return {
            retire: function(cde, cb) {              
                $http.post("/retireCde", cde).then(function(response) {
                    cb(response.data);
                });
            }
        }; 
    })    
    .factory("CsvDownload", function($window) {
        return {
            export: function(elts) {
                var str = '';
                for (var i = 0; i < elts.length; i++) {
                    var line = '';
                    for (var index in elts[i]) {
                        line += '"' + elts[i][index] + '",';
                    }
                    line.slice(0, line.Length - 1);
                    str += line + '\r\n';
                }
                return str;
            }            
        };
    })    
    .directive('ngVersionAvailable', ['$http', function($http) {
        return {
            require: 'ngModel',
            link: function(scope, ele, attrs, ctrl) {
                scope.$watch(attrs.ngModel, function() {
                    $http({
                        method: 'GET',
                        url: '/debytinyid/' + scope.elt.tinyId + "/" + scope.elt.version
                    }).success(function(data, status, headers, cfg) {
                        ctrl.$setValidity('unique', data === "");
                    }).error(function(data, status, headers, cfg) {
                        ctrl.$setValidity('unique', false);
                    });
                });
            }
        };
    }])
;    