angular.module('cdeModule').controller('CreateCdeCtrl',
    ['$scope', '$window', '$timeout', '$modal', 'DataElement', 'Elastic', 'userResource', '$controller'
        , function($scope, $window, $timeout, $modal, DataElement, Elastic, userResource, $controller)
{

    $scope.elt = {
        classification: [], stewardOrg: {}, naming: [{
            designation: "", definition: "", context: {
                contextName: "Health"
                , acceptability: "preferred"
            }
        }]
    };
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});
    $scope.openCdeInNewTab = true;

    $scope.searchSettings = {
        q: ""
        , page: 1
        , classification: []
        , classificationAlt: []
        , regStatuses: []
        , resultPerPage: $scope.resultPerPage
    };

    $scope.showSuggestions = function () {
        if (!$scope.elt.naming[0].designation || $scope.elt.naming[0].designation.length < 3) {
            return;
        }
        $scope.classificationFilters = [{
            org: $scope.searchSettings.selectedOrg
            , elements: $scope.searchSettings.selectedElements
        }, {
            org: $scope.searchSettings.selectedOrgAlt
            , elements: $scope.searchSettings.selectedElementsAlt
        }];
        $scope.searchSettings.q =  $scope.elt.naming[0].designation;
        Elastic.generalSearchQuery(Elastic.buildElasticQuerySettings($scope.searchSettings), "cde", function(err, result) {
            if (err) return;
            $scope.cdes = result.cdes;
        });
    };
}]);