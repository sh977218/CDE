angular.module('systemModule').controller('NewPvModalCtrl', ['$scope', '$uibModalInstance', '$timeout', '$http',
    function ($scope, $modalInstance, $timeout, $http) {

        $scope.newPv = {};
        $scope.umlsTerms = [];

        var _timeout;
        $scope.lookupUmls = function () {
            if (_timeout) {
                $timeout.cancel(_timeout)
            }
            _timeout = $timeout(function() {
                _timeout = null;
                $http.get('/searchUmls?searchTerm=' + $scope.newPv.valueMeaningName).success(function(data) {
                    $scope.umlsTerms = data.result.results;
                });
            }, 500)
        };

        $scope.selectFromUmls = function($index) {
            $scope.newPv.valueMeaningName = $scope.umlsTerms[$index].name;
            $scope.newPv.valueMeaningCode = $scope.umlsTerms[$index].ui;
            $scope.newPv.codeSystemName = "UMLS";
            if (!$scope.newPv.permissibleValue || $scope.newPv.length === 0) {
                $scope.newPv.permissibleValue = $scope.umlsTerms[$index].name;
            }
        };

        $scope.cancelCreate = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.okCreate = function () {
            $modalInstance.close($scope.newPv);
        };
    }]);