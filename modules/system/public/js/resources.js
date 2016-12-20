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
                $http.post('/login', user).success(success).error(error);
            },
            logout: function (success, error) {
                $http.post('/logout').success(success).error(error);
            }
        };
    }])
    .factory("Attachment", ["$http", function ($http) {
        return {
            remove: function (dat, success, error) {
                $http.post('/removeAttachment', dat).success(success).error(error);
            }
            , setDefault: function (dat, success, error) {
                $http.post('/setAttachmentDefault', dat).success(success).error(error);
            }
        };
    }])
    .factory("AccountManagement", ["$http", function ($http) {
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
    }])
    .factory('ViewingHistory', ["$http", "$q", function ($http, $q) {
        var viewHistoryResource = this;
        this.deferred = $q.defer();

        $http.get('/viewingHistory/:start').then(function (response) {
            viewHistoryResource.deferred.resolve(response.data);
        });
        this.getPromise = function () {
            return viewHistoryResource.deferred.promise;
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
    .factory('userResource', ["$http", "$q", function ($http, $q) {
        var userResource = this;
        this.user = null;
        this.deferred = $q.defer();

        $http.get('/user/me').then(function (response) {
            var u = response.data;
            if (u === "Not logged in.") {
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
