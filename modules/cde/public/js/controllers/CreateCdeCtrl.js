angular.module('cdeModule').controller('CreateCdeCtrl',
    ['$scope', '$window', '$timeout', '$uibModal', 'DataElement', 'Elastic',
        function ($scope, $window, $timeout, $modal, DataElement, Elastic) {

        $scope.elt = {
            classification: [],
            stewardOrg: {},
            naming: [{
                designation: "", definition: "", tags: []
            }],
            registrationState: {registrationStatus: "Incomplete"}
        };

        $scope.cdes = [];

        $scope.openCdeInNewTab = true;

        $scope.searchSettings = {
            q: ""
            , page: 1
            , classification: []
            , classificationAlt: []
            , regStatuses: []
            , resultPerPage: $scope.resultPerPage
        };

        $scope.showSuggestions = function (event) {
            if (event.length < 3) return;
            $scope.classificationFilters = [{
                org: $scope.searchSettings.selectedOrg,
                elements: $scope.searchSettings.selectedElements
            }, {
                org: $scope.searchSettings.selectedOrgAlt,
                elements: $scope.searchSettings.selectedElementsAlt
            }];
            $scope.searchSettings.q =  event.trim();
            Elastic.generalSearchQuery(Elastic.buildElasticQuerySettings($scope.searchSettings), "cde", function(err, result) {
                if (err) return;
                $scope.cdes = result.cdes;
                $scope.cdes.forEach(function (cde) {
                    cde.getEltUrl = function () {
                        return "/deView?tinyId=" + this.tinyId;
                    };
                    cde.getLabel = function () {
                        if (this.primaryNameCopy)
                            return this.primaryNameCopy;
                        else return this.naming[0].designation;
                    };
                });
            });
        };

        $scope.redirectToHome = function () {
            window.location.href = "/";
        };
    }]);