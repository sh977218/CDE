angular.module('systemModule')
    .factory('SearchSettings', function(localStorageService) {
        var searchSettings = localStorageService.get("SearchSettings");
        return {
            getConfiguration: function () {
                return searchSettings;
            }
            , saveConfiguration: function(settings) {
                searchSettings = settings;
                localStorageService.set("SearchSettings", settings);
            }
            , getDefault: function() {
                return {
                    "defaultSearchView": "accordion"
                    , "tableViewFields": {
                        "cde": {
                            "name": true,
                            "naming": true,
                            "permissibleValues": true,
                            "stewardOrg": true,
                            "usedBy": true,
                            "registrationStatus": true,
                            "administrativeStatus": true,
                            "ids": true
                        }
                    }
                };
            }
            , getDefaultSearchView: function() {
                return searchSettings.defaultSearchView;
            }
        };
    });