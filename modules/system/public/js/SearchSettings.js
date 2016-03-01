angular.module('ElasticSearchResource')
    .factory('SearchSettings', function (localStorageService, $q, userResource) {
        var searchSettingsFactory = this;
        this.deferred = $q.defer();

        this.saveConfiguration = function (settings) {
            searchSettings = settings;
            localStorageService.set("SearchSettings", settings);
            userResource.updateSearchSettings(settings);
        };
        this.getDefault = function () {
            return {
                "defaultSearchView": "summary"
                , "lowestRegistrationStatus": "Qualified"
                , "tableViewFields": {
                    "cde": {
                        "name": true,
                        "naming": true,
                        "permissibleValues": true,
                        "nbOfPVs": true,
                        "uom": false,
                        "stewardOrg": true,
                        "usedBy": true,
                        "registrationStatus": true,
                        "administrativeStatus": false,
                        "ids": true,
                        "source": false,
                        "updated": false
                    }
                }
            };
        };

        var searchSettings = localStorageService.get("SearchSettings");
        if (!searchSettings) searchSettings = this.getDefault();
        if (searchSettings.defaultSearchView === 'accordion') searchSettings.defaultSearchView = "summary";

        this.getDefaultSearchView = function () {
            return searchSettings.defaultSearchView;
        };
        this.getPromise = function () {
            return searchSettingsFactory.deferred.promise;
        };
        this.getUserDefaultStatuses = function() {
            var overThreshold = false;
            return exports.statusList.filter(function(status) {
                if (overThreshold) return false;
                overThreshold = searchSettings.lowestRegistrationStatus === status;
                return true;
            });
        };
        userResource.getPromise().then(function(user){
            if (user === "Not logged in.") {
                if (!searchSettings.lowestRegistrationStatus) searchSettings.lowestRegistrationStatus = "Qualified";
                searchSettingsFactory.deferred.resolve(searchSettings);
            }
            else {
                if (!user.searchSettings) user.searchSettings = searchSettingsFactory.getDefault();
                searchSettings = user.searchSettings;
                if (!user.searchSettings.lowestRegistrationStatus) user.searchSettings.lowestRegistrationStatus = "Qualified";
                if (user.searchSettings.defaultSearchView === 'accordion') user.searchSettings.defaultSearchView = "summary";
                searchSettingsFactory.deferred.resolve(user.searchSettings);
            }
        });
        return this;
    });