angular.module('systemModule').controller('EmbedCtrl', function($scope, $http) {

    $scope.selection = {
        org: $scope.myOrgs[0],
        primaryDefinition: true,
        sourceId: true,
        sourceVersion: true,
        pageSize: 5,
        width: 1000,
        height: 900
    };

    $scope.getEmbeds = function() {
        $http.get("/org/" + $scope.selection.org).then(function(result) {

        });
    };


    $scope.getEmbedCode = function() {
        var res = "<iframe type='text/html' id='nlmcdeIFrame' src='http://localhost:3001/embedded/public/html/index.html?org=" +
            $scope.selection.org + "&primaryDefinition=" + $scope.selection.primaryDefinition +
            "&sourceId=" + $scope.selection.sourceId +
            "&sourceVersion=" + $scope.selection.sourceVersion +
            "&pageSize=" + $scope.selection.pageSize +
            "&lowestRegistrationStatus=" + $scope.selection.lowestRegistrationStatus +
            "' width='" + $scope.selection.width + "px' height='" + $scope.selection.height + "px'></iframe>";
        return "Kfjf";
    };


});
