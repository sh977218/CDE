angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', 'userResource'
        , function($scope, $controller, userResource) {

    $scope.module = "form";    
    //$controller('ListCtrl', {$scope: $scope});

    //userResource.getPromise().then(function(){
    //    $scope.search();
    //});

}]);

angular.module('formModule').controller('FormDEListCtrl', ['$scope'
    , function($scope)
{

    $scope.embedded = true;

    $scope.reset = function() {
        $scope.initSearch();
        $scope.reload();
    };

    $scope.termSearch = function() {
        $scope.reload();
    };

    $scope.selectElement = function(e) {
        $scope._selectElement(e);
        $scope.reload();
    };

    $scope.alterOrgFilter = function(orgName) {
        $scope._alterOrgFiler(orgName);
        $scope.reload();
    };

}]);