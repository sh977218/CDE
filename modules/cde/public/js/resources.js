//TODO - refactor all CDE related services into one factory
// with prospective methods.
angular.module('resources', ['ngResource'])
    .factory('BoardSearch', function($resource) {
        return $resource('/listboards');
    })
    .factory('DataElement', function($resource) {
        return $resource('/dataelement/:deId', {deId: '@deId'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
    })
    .factory('DataElementUUID', function($resource) {
        return $resource('/debyuuid/:uuid/:version', {uuid: '@uuid', version: '@version'});
    })
    .factory('CdeList', function($http) {
        return {
            byUuidList: function(ids, cb) {              
                $http.post("/cdesByUuidList", ids).then(function(response) {
                    cb(response.data);
                });
            }
        }; 
    })
    .factory('Form', function($resource) {
        return $resource('/form/:formId', {formId: '@formId'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
    })
    .factory('PriorCdes', function($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdesInForm', function($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdeDiff', function($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'});
    })           
    .factory('Auth', function($http){
        return {
            register: function(user, success, error) {
                $http.post('/register', user).success(success).error(error);
            },
            login: function(user, success, error) {
                $http.post('/login', user).success(success).error(error);
            },
            logout: function(success, error) {
                $http.post('/logout').success(success).error(error);
            }
        };
    })
    .factory("Attachment", function($http) {
        return {
          remove: function(dat, success, error) {
              $http.post('/removeAttachment', dat).success(success).error(error);
          }
          , setDefault: function(dat, success, error) {
              $http.post('/setAttachmentDefault', dat).success(success).error(error);
          }
        };
    })
    .factory("Comment", function($http) {
        return {
          addComment: function(comment, success, error) {
            $http.post('/addComment', comment).success(success).error(error);
          }
          , removeComment: function(dat, success, error) {
              $http.post('/removeComment', dat).success(success).error(error);
          } 
        };
    })
    .factory("AccountManagement", function($http) {
        return {
          addSiteAdmin: function(user, success, error) {
            $http.post('/addSiteAdmin', user).success(success).error(error);
          }  
          , removeSiteAdmin: function(user, success, error) {
            $http.post('/removeSiteAdmin', user).success(success).error(error);
          }  
          , addOrgAdmin: function(user, success, error) {
            $http.post('/addOrgAdmin', user).success(success).error(error);
          }  
          , addOrgCurator: function(user, success, error) {
            $http.post('/addOrgCurator', user).success(success).error(error);
          }  
          , removeOrgAdmin: function(data, success, error) {
            $http.post('/removeOrgAdmin', data).success(success).error(error);
          }  
          , removeOrgCurator: function(data, success, error) {
            $http.post('/removeOrgCurator', data).success(success).error(error);
          }  
          , addOrg: function(data, success, error) {
            $http.post('/addOrg', data).success(success).error(error);
          }  
          , removeOrg: function(id, success, error) {
            $http.post('/removeOrg', id).success(success).error(error);
          }
          , updateOrg: function(org, success, error) {
              $http.post('/updateOrg', org).success(success).error(error);
          }
        };
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
    .factory('Myself', function($resource) {
        return $resource('/user/me');
    })
    .factory('ViewingHistory', function($resource) {
        return $resource('/viewingHistory/:start', {start: '@start'}, 
            {'getCdes': {method: 'GET', isArray: true}});
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
    .factory("Organization", function($http) {
        return {
            getByName: function(orgName, cb) {
                $http.get("/org/" + orgName).then(function(response) {
                   if (cb) cb(response);
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
                  url: '/debyuuid/' + scope.elt.uuid + "/" + scope.elt.version
                }).success(function(data, status, headers, cfg) {
                  ctrl.$setValidity('unique', data == "");
                }).error(function(data, status, headers, cfg) {
                  ctrl.$setValidity('unique', false);
                });
          });
        }
      };
    }]);    
    ;