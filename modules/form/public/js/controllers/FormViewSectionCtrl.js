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
        $scope.section.cardinalityOption = $scope.getCardinalityOption($scope.section.cardinality.min, $scope.section.cardinality.max);
        $scope.setCardinality = function() {
            switch ($scope.section.cardinalityOption) {
                case '1':
                    $scope.section.cardinality.min = 1;
                    $scope.section.cardinality.max = 1;
                    break;
                case '01':
                    $scope.section.cardinality.min = 0;
                    $scope.section.cardinality.max = 1;
                    break;
                case 'FQ':
                    $scope.section.cardinality.max = -2;
                    break;
                case '1+':
                    $scope.section.cardinality.min = 1;
                    $scope.section.cardinality.max = 10;
                    break;
                case '0+':
                    $scope.section.cardinality.min = 0;
                    $scope.section.cardinality.max = 10;
                    break;
            }
        };
    }]);
