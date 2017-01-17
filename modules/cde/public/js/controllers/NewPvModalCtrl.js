angular.module('systemModule').controller('NewPvModalCtrl', ['$scope', '$timeout', '$http',
    function ($scope, $timeout, $http) {

        $scope.newPv = {};
        $scope.umlsTerms = [];

        var _timeout;
        $scope.lookupUmls = function () {
            if (_timeout) {
                $timeout.cancel(_timeout);
            }
            _timeout = $timeout(function() {
                _timeout = null;
                $http.get('/searchUmls?searchTerm=' + $scope.newPv.valueMeaningName).then(function onSuccess(response) {
                    if (response.data.result && response.data.result.results)
                        $scope.umlsTerms = response.data.result.results;
                });
            }, 500);
        };

        $scope.selectFromUmls = function($index) {
            $scope.newPv.valueMeaningName = $scope.umlsTerms[$index].name;
            $scope.newPv.valueMeaningCode = $scope.umlsTerms[$index].ui;
            $scope.newPv.codeSystemName = "UMLS";
            if (!$scope.newPv.permissibleValue || $scope.newPv.length === 0) {
                $scope.newPv.permissibleValue = $scope.umlsTerms[$index].name;
            }
        };
    }]);