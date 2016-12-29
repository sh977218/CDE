angular.module('ElasticSearchResource')
    .factory('SearchSettings', ["localStorageService", "$q", "userResource", function (localStorageService, $q, userResource) {
        var version = 20160329;
        var searchSettingsFactory = this;
        this.deferred = $q.defer();

        this.saveConfiguration = function (settings) {
            searchSettings = JSON.parse(JSON.stringify(settings));
            delete settings.includeRetired;
            localStorageService.set("SearchSettings", settings);
            userResource.updateSearchSettings(settings);
        };
        this.getDefault = function () {
            return {
                "version": version
                , "defaultSearchView": "summary"
                , "lowestRegistrationStatus": "Qualified"
                , "tableViewFields": {
                    "name": true,
                    "naming": false,
                    "questionTexts": true,
                    "permissibleValues": true,
                    "nbOfPVs": true,
                    "uom": false,
                    "stewardOrg": true,
                    "usedBy": true,
                    "registrationStatus": true,
                    "administrativeStatus": false,
                    "ids": true,
                    "source": false,
                    "updated": false,
                    "numQuestions": true,
                    "tinyId": false
                }
            };
        };

        var searchSettings = localStorageService.get("SearchSettings");
        if (!searchSettings) searchSettings = this.getDefault();

        this.getDefaultSearchView = function () {
            return searchSettings.defaultSearchView;
        };
        this.getPromise = function () {
            return searchSettingsFactory.deferred.promise;
        };
        this.getUserDefaultStatuses = function () {
            var overThreshold = false;
            var result = exports.statusList.filter(function (status) {
                if (overThreshold) return false;
                overThreshold = searchSettings.lowestRegistrationStatus === status;
                return true;
            });
            if (searchSettings.includeRetired) result.push("Retired");
            return result;
        };
        userResource.getPromise().then(function (user) {
            if (user === "Not logged in.") {
            }
            else {
                if (!user.searchSettings) {
                    user.searchSettings = searchSettingsFactory.getDefault();
                }
                searchSettings = user.searchSettings;
            }
            if (searchSettings.version !== version) searchSettings = searchSettingsFactory.getDefault();
            searchSettingsFactory.deferred.resolve(searchSettings);
        });
        return this;
    }]);