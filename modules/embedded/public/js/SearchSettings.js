import * as regStatusShared from "../../../system/shared/regStatusShared";

angular.module('ElasticSearchResource')
    .factory('SearchSettings', function () {

        this.getDefault = function() {
            return {
                "defaultSearchView": "summary"
                , "lowestRegistrationStatus": "Qualified"
                , "tableViewFields": {
                    "name": true,
                    "naming": true,
                    "permissibleValues": true,
                    "nbOfPVs": true,
                    "uom": false,
                    "stewardOrg": false,
                    "usedBy": false,
                    "registrationStatus": false,
                    "administrativeStatus": false,
                    "ids": true,
                    "source": false,
                    "updated": false,
                    "numQuestions": true,
                    "tinyId": false
                }
            };
        };


        this.getUserDefaultStatuses = function() {
            var searchSettings = this.getDefault();

            var overThreshold = false;
            return regStatusShared.orderedList.filter(function(status) {
                if (overThreshold) return false;
                overThreshold = searchSettings.lowestRegistrationStatus === status;
                return true;
            });

        };
        return this;
    });