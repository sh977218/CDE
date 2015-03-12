angular.module('cdeModule')
.config(function($routeProvider) {
    $routeProvider.
    when('/cde/search', {controller: 'DEListCtrl', templateUrl: 'template/system/list'}).
    when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/quickBoard'}).
    when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/sdcView'}).
    when('/boardExport/:boardId', {controller: 'ExportCtrl', templateUrl: '/cde/public/html/boardExport.html'}).
    when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/exportCdeSearch'}).
    when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/myboards'}).
    when('/board/:boardId', {controller: 'BoardViewCtrl', templateUrl: '/board'}).
    when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/boardList'}).   
    when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/createcde'}).
    when('/deview', {controller: 'DEViewCtrl', templateUrl: '/deview'});
});

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
    return $resource('/cdediff/:deId', {deId: '@deId'}, {get: {isArray: true}});
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