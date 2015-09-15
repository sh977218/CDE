angular.module('formModule').controller('FormListCtrl', ['$scope', '$controller', 'userResource'
        , function($scope, $controller, userResource)
{

    $scope.module = "form";

    userResource.getPromise().then(function(){
        $scope.search("form");
    });

    var findFormQuestions = function (fe) {
        var n = 0;
        if (fe.formElements != undefined) {
            fe.formElements.forEach(function (e) {
                if (e.elementType && e.elementType === 'question') n++;
                else n = findFormQuestions(e);
            })
        }
        return n;
    };

    $scope.localEltTransform = function(elt) {
        elt.numQuestions = findFormQuestions(elt);
    };

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