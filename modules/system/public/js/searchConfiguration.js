angular.module('systemModule')
    .factory('SearchConfiguration', function(localStorageService) {
        //var searchConfiguration =  {
        //    "tableViewFields": {
        //        "cde": {
        //            "name": true
        //            , "naming": true
        //            , "permissibleValues": true
        //            , "stewardOrg": true
        //            , "usedBy": true
        //            , "registrationStatus": true
        //            , "administrativeStatus": true
        //            , "ids": true
        //        }
        //    }
        //};
        //localStorageService.set("tableViewFields", searchConfiguration);
        var SearchConfigurationObject = localStorageService.get("tableViewFields");
        return {
            getConfiguration: function () {
                return SearchConfigurationObject;
            }
        };
    });