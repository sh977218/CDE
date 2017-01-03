angular.module('formModule').controller('FormViewSectionCtrl', ['$scope',
    function ($scope) {
        $scope.nbOfEltsLimit = 5;
        $scope.raiseLimit = function(formElements) {
            if (formElements) {
                if ($scope.nbOfEltsLimit < formElements.length) {
                    $scope.nbOfEltsLimit += 5;
                } else {
                    $scope.nbOfEltsLimit = Infinity;
                }
            }
        };
    }]);
