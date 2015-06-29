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
                }).success(function(data, status, headers, cfg) {
                    if (lastVersion !== scope.elt.version) return;
                    ctrl.$setValidity('unique', !data);
                }).error(function(data, status, headers, cfg) {
                    if (lastVersion !== scope.elt.version) return;
                    ctrl.$setValidity('unique', false);
                });
            });
        }
    };
}])
.factory("QuickBoard", function(CdeList, OrgHelpers, userResource, localStorageService) {
    return {
        restoreFromLocalStorage: function() {
            var res = localStorageService.get("quickBoard");
            if (!res) res = [];
            this.elts = res;
        },
        max_elts: 10,
        elts: [],
        loading: false,
        add: function(elt) {
            if(this.elts.length < this.max_elts) {
                this.elts.push(elt);
            }
            localStorageService.add("quickBoard", this.elts);
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
        },
        loadElts: function(cb) {
            if (this.elts.length > 0) {
                var qb = this;
                qb.loading = true;
                var tinyIds = this.elts.map(function(elt) {
                    return elt.tinyId;
                });
                CdeList.byTinyIdList(tinyIds, function(result) {
                    if(result) {
                        for (var i = 0; i < qb.elts.length; i++) {
                            result.forEach(function(res) {
                                if (res.tinyId === qb.elts[i].tinyId) {
                                     qb.elts[i] = res;
                                }
                            })
                        }
                        qb.elts.forEach(function (elt) {
                            elt.usedBy = OrgHelpers.getUsedBy(elt, userResource.user);
                        });
                    }
                    qb.loading = false;
                    if (cb) cb();
                });
            }
        }
    }
});
;    