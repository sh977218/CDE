function QuickBoardObj(type, $http, OrgHelpers, userResource, localStorageService) {
    var params = {
        cde: {
            url: "/debytinyid/",
            localStorage: "quickBoard"
        },
        form: {
            url: "/form/",
            localStorage: "formQuickBoard"
        }
    };
    var param = params[type];

    return {
        restoreFromLocalStorage: function () {
            var res = localStorageService.get(param.localStorage);
            if (!res) res = [];
            this.elts = res;
        },
        max_elts: 50,
        elts: [],
        numberDisplay: function () {
            if (this.elts.length === 0) return " empty ";
            if (this.elts.length > this.max_elts - 1) return " full ";
            return " " + this.elts.length + " ";
        },
        loading: false,
        add: function (elt) {
            var qb = this;
            if (this.elts.length < this.max_elts) {
                $http.get(param.url + elt.tinyId).then(function (result) {
                    var de = result.data;
                    if (de) {
                        de.usedBy = OrgHelpers.getUsedBy(de, userResource.user);
                        qb.elts.push(de);
                        localStorageService.add(param.localStorage, qb.elts);
                    }
                });
            }
        },
        remove: function (index) {
            this.elts.splice(index, 1);
            localStorageService.add(param.localStorage, this.elts);
        },
        empty: function () {
            this.elts = [];
            localStorageService.add(param.localStorage, this.elts);
        },
        canAddElt: function (elt) {
            if (this.elts.length < this.max_elts &&
                elt !== undefined) {

                var tinyIds = this.elts.map(function (_elt) {
                    return _elt.tinyId;
                });
                return tinyIds.indexOf(elt.tinyId) === -1;
            }
            else {
                return false;
            }
        }
    }
}

angular.module('resourcesSystem', ['ngResource'])
    .factory('Auth', function ($http) {
        return {
            register: function (user, success, error) {
                $http.post('/register', user).success(success).error(error);
            },
            login: function (user, success, error) {
                $http.post('/login', user).success(success).error(error);
            },
            logout: function (success, error) {
                $http.post('/logout').success(success).error(error);
            }
        };
    })
    .factory("Attachment", function ($http) {
        return {
            remove: function (dat, success, error) {
                $http.post('/removeAttachment', dat).success(success).error(error);
            }
            , setDefault: function (dat, success, error) {
                $http.post('/setAttachmentDefault', dat).success(success).error(error);
            }
        };
    })
    .factory("AccountManagement", function ($http) {
        return {
            addSiteAdmin: function (user, success, error) {
                $http.post('/addSiteAdmin', user).success(success).error(error);
            }
            , removeSiteAdmin: function (user, success, error) {
                $http.post('/removeSiteAdmin', user).success(success).error(error);
            }
            , addOrgAdmin: function (user, success, error) {
                $http.post('/addOrgAdmin', user).success(success).error(error);
            }
            , addOrgCurator: function (user, success, error) {
                $http.post('/addOrgCurator', user).success(success).error(error);
            }
            , removeOrgAdmin: function (data, success, error) {
                $http.post('/removeOrgAdmin', data).success(success).error(error);
            }
            , removeOrgCurator: function (data, success, error) {
                $http.post('/removeOrgCurator', data).success(success).error(error);
            }
            , addOrg: function (data, success, error) {
                $http.post('/addOrg', data).success(success).error(error);
            }
            , removeOrg: function (id, success, error) {
                $http.post('/removeOrg', id).success(success).error(error);
            }
            , updateOrg: function (org, success, error) {
                $http.post('/updateOrg', org).success(success).error(error);
            }
            , transferSteward: function (transferStewardObj, successMsg, errorMsg) {
                $http.post('/transferSteward', transferStewardObj).success(successMsg).error(errorMsg);
            }
            , getAllUsernames: function (usernames, errorMsg) {
                $http.get('/getAllUsernames').success(usernames).error(errorMsg);
            }
        };
    })
    .factory('ViewingHistory', function ($resource) {
        return $resource('/viewingHistory/:start', {start: '@start'},
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory("Organization", function ($http) {
        return {
            getByName: function (orgName, cb) {
                $http.get("/org/" + encodeURIComponent(orgName)).then(function (response) {
                    if (cb) cb(response);
                });
            }
        };
    })
    .factory("TourContent", function () {
        return {
            stop: null
            , steps: []
        };
    })
    .factory('userResource', function ($http, $q) {
        var userResource = this;
        this.user = null;
        this.deferred = $q.defer();

        $http.get('/user/me').then(function (response) {
            var u = response.data;
            if (u == "Not logged in.") {
                userResource.user = {userLoaded: true};
            } else {
                userResource.user = u;
                userResource.setOrganizations();
                userResource.user.userLoaded = true;
            }
            userResource.deferred.resolve(response.data);
        });
        this.getPromise = function () {
            return userResource.deferred.promise;
        };
        this.setOrganizations = function () {
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

        this.updateSearchSettings = function (settings) {
            if (!userResource.user || !userResource.user.username) return;
            $http.post("/user/update/searchSettings", settings);
        };
        return this;
    })
    .factory("CsvDownload", function () {
        return {
            export: function (elts) {
                var str = '';
                for (var i = 0; i < elts.length; i++) {
                    var line = '';
                    elts.forEach(function (elt) {
                        line += '"' + elt[index] + '",';
                    });
                    line.slice(0, line.Length - 1);
                    str += line + '\r\n';
                }
                return str;
            }
        };
    })
    .factory("AutoCompleteResource", function ($http) {
        return {
            suggest: function (searchTerm) {
                return $http.get('/cdeCompletion/' + encodeURIComponent(searchTerm), {}).then(function (response) {
                    return response.data;
                });
            }
        }
    })
    .factory("SearchResultResource", function () {
        return {
            elts: []
        }
    })
    .factory('LoginRedirect', function ($location) {
        var lastRoute;
        return {
            storeRoute: function () {
                if ($location.$$url.indexOf('login') === -1) lastRoute = $location.$$url;
            }
            , getPreviousRoute: function () {
                return lastRoute;
            }
        };
    })
    .factory("QuickBoard", function ($http, OrgHelpers, userResource, localStorageService) {
        var result = new QuickBoardObj("cde", $http, OrgHelpers, userResource, localStorageService);
        result.restoreFromLocalStorage();
        return result;
    })
    .factory("FormQuickBoard", function ($http, OrgHelpers, userResource, localStorageService) {
        var result = new QuickBoardObj("form", $http, OrgHelpers, userResource, localStorageService);
        result.restoreFromLocalStorage();
        return result;
    })
    ;

angular.module('compareModule', ['ngResource'])
    .factory("ObjectDiff", function() {
       return {
           arrayDiff: function(left, right, options) {
               options.stringArray = false;
               if ((leftObj && leftObj[0] && typeof leftObj[0] === 'string' )
                   || (rightObj && rightObj[0] && typeof rightObj[0] === 'string')) {
                   options.stringArray = true;
               }
               if (options.sortIt) {
                   this.sortByProperty(leftObj, $scope.sortby);
                   this.sortByProperty(rightObj, $scope.sortby);
               }
               // @TODO instead of comparedBasedOn, give callback function
               var rightIds = rightObj.map(function (o) {
                   _this.wipeUseless(o, $scope);
                   if (!options.compareBasedOn) {
                       return JSON.stringify(o);
                   } else {
                       return _this.getValueByNestedProperty(o, options.compareBasedOn);
                   }
               });
               var leftIndex = 0;
               var beginIndex = 0;
               leftObj.forEach(function (o) {
                   _this.wipeUseless(o, $scope);
                   var id = JSON.stringify(o);
                   if ($scope.comparebasedon) {
                       id = _this.getValueByNestedProperty(o, $scope.comparebasedon);
                   }
                   var rightIndex = rightIds.slice(beginIndex, rightIds.length).indexOf(id);
                   // element didn't found in right list.
                   if (rightIndex === -1) {
                       // put all right list elements before this element
                       if (beginIndex === 0) {
                           for (var m = 0; m < rightObj.length; m++) {
                               result.push({
                                   action: "space",
                                   rightIndex: m
                               });
                               beginIndex++;
                           }
                       }
                       // put this element not found
                       result.push({
                           action: "not found",
                           leftIndex: leftIndex
                       });
                   }
                   // element found in right list
                   else {
                       // put all right elements before matched element
                       var _beginIndex = beginIndex;
                       for (var k = 0; k < rightIndex; k++) {
                           result.push({
                               action: "space",
                               rightIndex: beginIndex + rightIndex - 1
                           });
                           beginIndex++;
                       }
                       // put this element found
                       var temp = {
                           action: "found",
                           leftIndex: leftIndex,
                           rightIndex: _beginIndex + rightIndex
                       };
                       var resultObj = [];
                       options.properties.forEach(function (p) {
                           if (JSON.stringify(_this.getValueByNestedProperty(leftObj[leftIndex], p.property))
                               === JSON.stringify(_this.getValueByNestedProperty(rightObj[rightIndex], p.property))) {
                               p.match = true;
                           } else p.match = false;
                           resultObj.push(p);
                       });
                       temp.result = resultObj;
                       result.push(temp);
                       match++;
                       beginIndex++;
                   }
                   leftIndex++;
               });
               // if after looping left list, there are element in the right list, put all of them
               for (var i = beginIndex; i < rightIds.length; i++)
                   result.push({
                       action: "space",
                       rightIndex: i
                   })
               return {result: result, match: match};           }
       }
    });


