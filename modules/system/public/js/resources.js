function QuickBoardObj(type, $http, OrgHelpers, userResource, localStorageService, Alert) {
    var params = {
        cde: {
            url: "/de/",
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
            this.elts.forEach(function (elt) {
                if (!elt.primaryNameCopy) elt.primaryNameCopy = elt.naming[0].designation;
                if (!elt.primaryDefinitionCopy) elt.primaryDefinitionCopy = elt.naming[0].definition;
            });
        },
        elts: [],
        loading: false,
        add: function (elt) {
            var qb = this;
            $http.get(param.url + elt.tinyId).then(function (result) {
                var de = result.data;
                if (de) {
                    de.usedBy = OrgHelpers.getUsedBy(de, userResource.user);
                    de.primaryNameCopy = de.naming[0].designation;
                    de.primaryDefinitionCopy = de.naming[0].definition;
                    qb.elts.push(de);
                    localStorageService.add(param.localStorage, qb.elts);
                    Alert.addAlert("success", "Added to QuickBoard!");
                }
            });
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
            if (elt !== undefined) {
                var tinyIds = this.elts.map(function (_elt) {
                    return _elt.tinyId;
                });
                return tinyIds.indexOf(elt.tinyId) === -1;
            }
            else {
                return false;
            }
        }
    };
}

angular.module('resourcesSystem', ['ngResource'])
    .factory("Attachment", ["$http", function ($http) {
        return {
            remove: function (dat, success, error) {
                $http.post('/removeAttachment', dat).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , setDefault: function (dat, success, error) {
                $http.post('/setAttachmentDefault', dat).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
        };
    }])
    .factory("AccountManagement", ["$http", function ($http) {
        return {
            addSiteAdmin: function (user, success, error) {
                $http.post('/addSiteAdmin', user).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , removeSiteAdmin: function (user, success, error) {
                $http.post('/removeSiteAdmin', user).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , addOrgCurator: function (user, success, error) {
                $http.post('/addOrgCurator', user).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , removeOrgCurator: function (data, success, error) {
                $http.post('/removeOrgCurator', data).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , addOrg: function (data, success, error) {
                $http.post('/addOrg', data).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , removeOrg: function (id, success, error) {
                $http.post('/removeOrg', id).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , updateOrg: function (org, success, error) {
                $http.post('/updateOrg', org).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , transferSteward: function (transferStewardObj, success, error) {
                $http.post('/transferSteward', transferStewardObj).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
            , getAllUsernames: function (success, error) {
                $http.get('/getAllUsernames').then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
        };
    }])
    .factory("Organization", ["$http", function ($http) {
        return {
            getByName: function (orgName, cb) {
                $http.get("/org/" + encodeURIComponent(orgName)).then(function (response) {
                    if (cb) cb(response);
                });
            }
        };
    }])
    .factory("TourContent", [function () {
        return {
            stop: null
            , steps: []
        };
    }])
    .factory("userResource", ["$http", "$q", "$interval", "OrgHelpers", function ($http, $q, $interval, OrgHelpers) {
        var userResource = this;
        this.user = null;
        this.userHasMail = false;

        this.getRemoteUser = function () {
            userResource.deferred = $q.defer();
            $http.get('/user/me').then(function (response) {
                var u = response.data;
                if (u === "Not logged in.") {
                    userResource.user = {userLoaded: true};
                } else {
                    userResource.user = u;
                    userResource.setOrganizations();
                    userResource.user.userLoaded = true;
                }
                userResource.checkMail();
                userResource.deferred.resolve(response.data);
            });
        };
        this.getRemoteUser();
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

        this.checkMail = function () {
            if (userResource.user) {
                $http.get('/mailStatus').then(function onSuccess(response) {
                    if (response.data.count > 0) userResource.userHasMail = true;
                }, function () {
                });
            }
        };

        // $interval(function () {
        //     OrgHelpers.getOrgsDetailedInfoAPI();
        //     userResource.checkMail();
        // }, 600000);

        return this;
    }])
    .factory("AutoCompleteResource", ["$http", function ($http) {
        return {
            suggest: function (searchTerm) {
                return $http.get('/cdeCompletion/' + encodeURIComponent(searchTerm), {}).then(function (response) {
                    return response.data;
                });
            }
        };
    }])
    .factory("SearchResultResource", [function () {
        return {
            elts: []
        };
    }])
    .factory("QuickBoard", ["$http", "OrgHelpers", "userResource", "localStorageService", "AlertService",
        function ($http, OrgHelpers, userResource, localStorageService, Alert) {
            var result = new QuickBoardObj("cde", $http, OrgHelpers, userResource, localStorageService, Alert);
            result.restoreFromLocalStorage();
            return result;
        }])
    .factory("FormQuickBoard", ["$http", "OrgHelpers", "userResource", "localStorageService", "AlertService",
        function ($http, OrgHelpers, userResource, localStorageService, Alert) {
            var result = new QuickBoardObj("form", $http, OrgHelpers, userResource, localStorageService, Alert);
            result.restoreFromLocalStorage();
            return result;
        }])
;
