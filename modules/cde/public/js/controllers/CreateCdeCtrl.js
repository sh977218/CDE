angular.module('cdeModule').controller('CreateCdeCtrl',
    ['$scope', '$window', '$timeout', '$modal', 'DataElement', 'Elastic', 'userResource', '$controller'
        , function($scope, $window, $timeout, $modal, DataElement, Elastic, userResource, $controller) {

    $controller('CreateCdeAbstractCtrl', {$scope: $scope});
    $scope.openCdeInNewTab = true;
    $scope.currentPage = 1;
    $scope.totalItems = 0;
    $scope.resultPerPage = 20;
    $scope.searchForm = {};

        //$scope.elt = { classification: [], stewardOrg: {}, naming:[{designation: "", definition:""}]};
    
    $scope.save = function() {
        //$scope.elt.naming = [];
        $scope.elt.naming.push({
           designation: $scope.elt.naming[0].designation
           , definition: $scope.elt.naming[0].definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        DataElement.save($scope.elt, function(cde) {
            $window.location.href = "/#/deview?tinyId=" + cde.tinyId;
        });
    };

    
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