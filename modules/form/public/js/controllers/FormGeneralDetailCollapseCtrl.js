angular.module('formModule').controller('FormGeneralDetailCollapseCtrl',
    ['$scope', function ($scope) {
        $scope.leftPanel = 'col-lg-5';
        $scope.rightPanel = 'col-lg-7';
        $scope.arrow = '<<';
        $scope.switchCollapse = function () {
            if ($scope.leftPanel === 'col-lg-5') {
                $scope.leftPanel = 'hidden';
                $scope.rightPanel = 'col-lg-12';
                $scope.arrow = '>>';
            } else {
                $scope.leftPanel = 'col-lg-5';
                $scope.rightPanel = 'col-lg-7';
                $scope.arrow = '<<';
            }
        };
    }]);