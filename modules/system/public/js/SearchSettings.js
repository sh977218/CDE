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
                "defaultSearchView": "accordion"
                , "lowestRegistrationStatus": "Qualified"
                , "tableViewFields": {
                    "cde": {
                        "name": true,
                        "naming": true,
                        "permissibleValues": true,
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
        var searchSettings = localStorageService.get("SearchSettings");
        userResource.getPromise().then(function(user){
            if (user === "Not logged in.") {
                if (!searchSettings.lowestRegistrationStatus) searchSettings.lowestRegistrationStatus = "Qualified";
                searchSettingsFactory.deferred.resolve(searchSettings);
            }
            else {
                if (!user.searchSettings) user.searchSettings = searchSettingsFactory.getDefault();
                searchSettings = user.searchSettings;
                if (!user.searchSettings.lowestRegistrationStatus) user.searchSettings.lowestRegistrationStatus = "Qualified";
                searchSettingsFactory.deferred.resolve(user.searchSettings);
            }
        });
        if (!searchSettings) searchSettings = this.getDefault();
        return this;
    });