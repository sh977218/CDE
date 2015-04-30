angular.module('systemModule')
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
        var searchSettings = localStorageService.get("SearchSettings");
        userResource.getPromise().then(function(user){
            if (user === "Not logged in.") searchSettingsFactory.deferred.resolve(searchSettings);
            else searchSettingsFactory.deferred.resolve(user.searchSettings);
        });
        if (!searchSettings) searchSettings = this.getDefault();
        return this;
    });