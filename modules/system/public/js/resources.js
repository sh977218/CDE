angular.module('resourcesSystem', ['ngResource'])
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
          , transferSteward: function(transferStewardObj, successMsg, errorMsg) {
              $http.post('/transferSteward', transferStewardObj).success(successMsg).error(errorMsg);
          }
          , getAllUsernames: function(usernames, errorMsg) {
              $http.get('/getAllUsernames').success(usernames).error(errorMsg);
          }
        };
    })
    .factory('ViewingHistory', function($resource) {
        return $resource('/viewingHistory/:start', {start: '@start'}, 
            {'getCdes': {method: 'GET', isArray: true}});
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
    .factory("TourContent", function() {
        return {
            stop: null
            , steps: []
        };
    })
    .factory('userResource', function($http, $q) {
        var userResource = this;
        this.user = null;
        this.deferred = $q.defer();
        
        $http.get('/user/me').then(function(response) {
            var u = response.data;
            if (u == "Not logged in.") {
                userResource.user = {userLoaded: true};
            } else {
                userResource.user = u;
                userResource.setOrganizations();
                userResource.user.userLoaded = true;
            }
            userResource.deferred.resolve();
        });    
        this.getPromise = function(){
            return userResource.deferred.promise;
        };
        this.setOrganizations = function() {
            if (userResource.user && userResource.user.orgAdmin) {
                // clone orgAdmin array
                userResource.userOrgs = userResource.user.orgAdmin.slice(0);
                for (var i = 0; i < userResource.user.orgCurator.length; i++) {
                    if (userResource.userOrgs.indexOf(userResource.user.orgCurator[i]) < 0) {
                        userResource.userOrgs.push(userResource.user.orgCurator[i]);
                    }
                }
            } else {
                userResource.userOrgs = [];
            }
        };


        return this;
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

;    