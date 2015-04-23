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
        };
    });