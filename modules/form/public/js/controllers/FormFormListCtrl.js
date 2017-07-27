angular.module('formModule').controller('FormFormListCtrl', ['$scope', '$controller',
    function ($scope) {
        $scope.embedded = true;

        $scope.reset = function () {
            $scope.initSearch();
            $scope.reload('form');
        };

        $scope.termSearch = function () {
            $scope.reload('form');
        };

        $scope.pageChange = function () {
            $scope.reload('form');
        };

        $scope.selectElement = function (e) {
            $scope._selectElement(e);
            $scope.reload('form');
        };

        $scope.addStatusFilter = function (status) {
            var index = $scope.searchSettings.regStatuses.indexOf(status);
            if (index > -1) $scope.searchSettings.regStatuses.splice(index, 1);
            else $scope.searchSettings.regStatuses.push(status);
            $scope.reload('form');
        };

        $scope.addDatatypeFilter = function (datatype) {
            var index = $scope.searchSettings.datatypes.indexOf(datatype);
            if (index > -1) $scope.searchSettings.datatypes.splice(index, 1);
            else $scope.searchSettings.datatypes.push(datatype);
            $scope.reload('form');
        };

        $scope.alterOrgFilter = function (orgName) {
            $scope._alterOrgFiler(orgName);
            $scope.reload('form');
        };
    }]);
