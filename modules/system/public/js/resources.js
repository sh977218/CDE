function QuickBoardObj(type, $http, OrgHelpers, userResource, localStorageService, Alert) {
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
            this.elts.forEach(function(elt) {
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
    .factory('Auth',  ["$http", function ($http) {
        return {
            login: function (user, success, error) {
                $http.post('/login', user).then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            },
            logout: function (success, error) {
                $http.post('/logout').then(function onSuccess(response) {
                    success(response.data)
                }, function onError(response) {
                    error(response.data)
                });
            }
        };
    }])
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
    .factory('ViewingHistory', ["$http", "$q", function ($http, $q) {
        var viewHistoryResource = this;

        viewHistoryResource.deferred = $q.defer();
        this.getViewingHistory = function () {
            viewHistoryResource.deferred = $q.defer();
            $http.get('/viewingHistory').then(function (response) {
                viewHistoryResource.deferred.resolve(response.data);
            });
        };
        viewHistoryResource.formViewHistory = $q.defer();
        this.getFormViewingHistory = function () {
            viewHistoryResource.formViewHistory = $q.defer();
            $http.get('/viewingHistory/form').then(function (response) {
                viewHistoryResource.formViewHistory.resolve(response.data);
            });
        };

        this.getViewingHistory();
        this.getFormViewingHistory();

        this.getCdes = function () {
            return viewHistoryResource.deferred.promise;
        };
        this.getForms = function () {
            return viewHistoryResource.formViewHistory.promise;
        };
        return this;
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

        this.getRemoteUser = function() {
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
                }, function () {});
            }
        };

        $interval(function () {
            OrgHelpers.getOrgsDetailedInfoAPI();
            userResource.checkMail();
        }, 600000);

        this.doesUserOwnElt = function (elt) {
            return this.user && (this.user.siteAdmin || (this.user._id && (this.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1)));
        };

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
    .factory('LoginRedirect', ["$location", function ($location) {
        var lastRoute;
        return {
            storeRoute: function () {
                if ($location.$$url.indexOf('login') === -1) lastRoute = $location.$$url;
            }
            , getPreviousRoute: function () {
                return lastRoute;
            }
        };
    }])
    .factory("QuickBoard", ["$http", "OrgHelpers", "userResource", "localStorageService", "Alert",
        function ($http, OrgHelpers, userResource, localStorageService, Alert) {
        var result = new QuickBoardObj("cde", $http, OrgHelpers, userResource, localStorageService, Alert);
        result.restoreFromLocalStorage();
        return result;
    }])
    .factory("FormQuickBoard", ["$http", "OrgHelpers", "userResource", "localStorageService", "Alert",
        function ($http, OrgHelpers, userResource, localStorageService, Alert) {
        var result = new QuickBoardObj("form", $http, OrgHelpers, userResource, localStorageService, Alert);
        result.restoreFromLocalStorage();
        return result;
    }])
    .factory("Alert", ["$timeout", function($timeout){
        var alerts = [];
        var closeAlert = function (index) {
            alerts.splice(index, 1);
        };
        var addAlert = function (type, msg) {
            var id = (new Date()).getTime();
            alerts.push({type: type, msg: msg, id: id});
            $timeout(function () {
                for (var i = 0; i < alerts.length; i++) {
                    if (alerts[i].id === id) {
                        alerts.splice(i, 1);
                    }
                }
            }, window.userAlertTime);
        };
        var mapAlerts = function() {return alerts;};
        return {closeAlert: closeAlert, addAlert: addAlert, mapAlerts: mapAlerts};
    }])
    .factory("RegStatusValidator", ["OrgHelpers", function(OrgHelpers){
        var evalCde = function (cde, orgName, status, cdeOrgRules) {
            var orgRules = cdeOrgRules[orgName];
            var rules = orgRules.filter(function (r) {
                var s = r.targetStatus;
                if (status === 'Incomplete') return s === 'Incomplete';
                if (status === 'Candidate') return s === 'Incomplete' || s === 'Candidate';
                if (status === 'Recorded') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded';
                if (status === 'Qualified') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified';
                if (status === 'Standard') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified' || s === 'Standard';
                return true;
            });
            if (rules.length === 0) return [];
            return rules.map(function (r) {
                return {ruleName: r.ruleName, cdePassingRule: cdePassingRule(cde, r)};
            });
        };

        var conditionsMetForStatusWithinOrg = function (cde, orgName, status, cdeOrgRules) {
            if (!cdeOrgRules[orgName]) return true;
            var results = evalCde(cde, orgName, status, cdeOrgRules);
            return results.every(function (x) {
                return x.passing;
            });
        };

        var cdePassingRule = function (cde, rule) {
            function checkRe(field, rule) {
                return new RegExp(rule.rule.regex).test(field);
            }
            function lookForPropertyInNestedObject(object, rule, level) {
                var key = rule.field.split(".")[level];
                if (!object[key]) return false;
                if (level === rule.field.split(".").length - 1) return checkRe(object[key], rule);
                if (!Array.isArray(object[key])) return lookForPropertyInNestedObject(object[key], rule, level + 1);
                if (Array.isArray(object[key])) {
                    var result;
                    if (rule.occurence === "atLeastOne") {
                        result = false;
                        object[key].forEach(function (subTree) {
                            result = result || lookForPropertyInNestedObject(subTree, rule, level + 1);
                        });
                        return result;
                    }
                    if (rule.occurence === "all") {
                        result = true;
                        object[key].forEach(function (subTree) {
                            result = result && lookForPropertyInNestedObject(subTree, rule, level + 1);
                        });
                        return result;
                    }
                }
            }
            return lookForPropertyInNestedObject(cde, rule, 0);
        };

        var getOrgRulesForCde = function(cde){
            var result = {};
            cde.classification.forEach(function(org){
                result[org.stewardOrg.name] = OrgHelpers.getStatusValidationRules(org.stewardOrg.name);
            });
            return result;
        };

        var getStatusRules = function(cdeOrgRules){
            var cdeStatusRules = {
                Incomplete: {},
                Candidate: {},
                Recorded: {},
                Qualified: {},
                Standard: {},
                "Preferred Standard": {}
            };

            Object.keys(cdeOrgRules).forEach(function (orgName) {
                cdeOrgRules[orgName].forEach(function (rule) {
                    if (!cdeStatusRules[rule.targetStatus][orgName]) cdeStatusRules[rule.targetStatus][orgName] = [];
                    cdeStatusRules[rule.targetStatus][orgName].push(rule);
                });
            });
            return cdeStatusRules;
        };

        return {
            conditionsMetForStatusWithinOrg: conditionsMetForStatusWithinOrg
            , cdePassingRule: cdePassingRule
            , getOrgRulesForCde: getOrgRulesForCde
            , getStatusRules: getStatusRules
            , evalCde: evalCde
        };

    }])
;
