angular.module('systemModule').controller('SiteManagementCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.getSiteAdmins = function () {
        return $http.get("/siteAdmins").then(function (response) {
            $scope.siteAdmins = response.data;
        });
    };
    $scope.getSiteAdmins();

}]);