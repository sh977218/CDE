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
    .factory("Organization", ["$http", function ($http) {
        return {
            getByName: function (orgName, cb) {
                $http.get("/org/" + encodeURIComponent(orgName)).then(function (response) {
                    if (cb) cb(response);
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
