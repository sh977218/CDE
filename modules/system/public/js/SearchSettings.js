angular.module('systemModule')
    .factory('SearchSettings', function(localStorageService) {
         var searchSettingsFactory = {
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
                            "uom": false,
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
        var searchSettings = localStorageService.get("SearchSettings");
        if (!searchSettings) searchSettings = searchSettingsFactory.getDefault();
        return searchSettingsFactory;
    });