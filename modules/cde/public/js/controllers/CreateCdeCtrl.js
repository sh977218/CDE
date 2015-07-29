angular.module('cdeModule').controller('CreateCdeCtrl',
    ['$scope', '$window', '$timeout', '$modal', 'DataElement', 'Elastic', 'userResource', '$controller'
        , function($scope, $window, $timeout, $modal, DataElement, Elastic, userResource, $controller) {

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
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.resultPerPage = 20;
    $scope.searchForm = {};

    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        if (!$scope.elt.naming[0].designation || $scope.elt.naming[0].designation.length < 3) {
            return;
        }
        suggestionPromise = $timeout(function () {
            $scope.classificationFilters = [{
                org: $scope.selectedOrg
                , elements: $scope.selectedElements
            }, {
                org: $scope.selectedOrgAlt
                , elements: $scope.selectedElementsAlt
            }];
            var settings = Elastic.buildElasticQuerySettings($scope);
            settings.searchTerm = $scope.elt.naming[0].designation;
            Elastic.generalSearchQuery(settings, "cde", function(err, result) {
                if (err) return;
                $scope.cdes = result.cdes;
                $scope.totalItems = result.totalNumber;
            });
        }, 0);
    };



    
}
]);