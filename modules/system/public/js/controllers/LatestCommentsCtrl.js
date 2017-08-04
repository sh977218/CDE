angular.module('systemModule').controller('LatestCommentsCtrl',['$scope', '$http', function($scope, $http) {

    if (!$scope.commentsUrl) {
        $scope.commentsUrl = '/allComments/';
    }

    $scope.getComments = function (page) {
        $http.get($scope.commentsUrl + (page - 1) * 30 + "/30").then(function (result) {
            $scope.comments.latestComments = result.data;
            if ($scope.comments.latestComments.length === 0) {
                $scope.comments.totalItems = (page - 2) * 30;
            } else if ($scope.comments.latestComments.length < 30) {
                $scope.comments.totalItems = (page - 2) * 30 + $scope.comments.latestComments.length;
            }
        });
    };

    $scope.$watch("comments.currentCommentsPage", function () {
        $scope.getComments($scope.comments.currentCommentsPage);
    });
    $scope.comments = {currentCommentsPage: 1, totalItems: 10000};

    $scope.getEltLink = function (c) {
        return {
                'cde': "/deView?tinyId=",
                'form': "/formView?tinyId=",
                'board': "/board/"
            }[c.element.eltType] + c.element.eltId;
    };
}]);

