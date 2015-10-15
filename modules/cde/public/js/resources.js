angular.module('resourcesCde', ['ngResource'])
.factory('BoardSearch', function($resource) {
    return $resource('/listboards');
})
.factory('DataElement', function($resource) {
    return $resource('/dataelement/:deId', {deId: '@deId'}, {update: {method: 'PUT'},
        save: {method: 'POST', params: {type: null} }});
})
.factory('DataElementTinyId', function($resource) {
    return $resource('/cdebytinyid/:tinyId/:version', {tinyId: 'tinyId', version: '@version'});
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
.factory('ElasticBoard', function($http) {
    return {
        basicSearch: function(query, cb) {
            $http.post("/boardSearch", query).then(function(response) {
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
            var url;
            scope.$watch(attrs.ngModel, function() {
                var lastVersion = scope.elt.version;
                if (scope.elt.formElements) {
                    url = '/formbytinyid/' + scope.elt.tinyId + "/" + scope.elt.version;
                } else {
                    url = '/deExists/' + scope.elt.tinyId + "/" + scope.elt.version
                }
                $http({
                    method: 'GET',
                    url: url
                }).success(function(data) {
                    if (lastVersion !== scope.elt.version) return;
                    ctrl.$setValidity('unique', !data);
                }).error(function() {
                    if (lastVersion !== scope.elt.version) return;
                    ctrl.$setValidity('unique', false);
                });
            });
        }
    };
}])
.factory("QuickBoard", function($http, OrgHelpers, userResource, localStorageService) {
    return {
        restoreFromLocalStorage: function() {
            var res = localStorageService.get("quickBoard");
            if (!res) res = [];
            this.elts = res;
        },
        max_elts: 50,
        elts: [],
        numberDisplay: function() {
            if (this.elts.length === 0) return " empty "
            if (this.elts.length > this.max_elts - 1) return " full ";
            return " " + this.elts.length + " ";
        },
        loading: false,
        add: function(elt) {
            var qb = this;
            if(this.elts.length < this.max_elts) {
                $http.get("/cdebytinyid/" + elt.tinyId).then(function(result) {
                    var de = result.data;
                    if (de) {
                        de.usedBy = OrgHelpers.getUsedBy(de, userResource.user);
                        qb.elts.push(de);
                        localStorageService.add("quickBoard", qb.elts);
                    }
                });
            }
        },
        remove: function(index) {
            this.elts.splice(index, 1);
            localStorageService.add("quickBoard", this.elts);
        },
        empty: function() {
            this.elts = [];
            localStorageService.add("quickBoard", this.elts);
        },
        canAddElt: function(elt) {
            if (this.elts.length < this.max_elts &&
                elt !== undefined) {

                var tinyIds = this.elts.map(function(_elt) {
                    return _elt.tinyId;
                });
                return tinyIds.indexOf(elt.tinyId) === -1;
            }
            else {
                return false;
            }
        }
    }
});
