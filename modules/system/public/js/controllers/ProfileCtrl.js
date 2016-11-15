angular.module('systemModule').controller('ProfileCtrl',
    ['$scope', 'ViewingHistory', '$timeout', '$http', 'userResource', 'Alert',
        function ($scope, ViewingHistory, $timeout, $http, userResource, Alert)
{
    ViewingHistory.getPromise().then(function (response) {
        $scope.cdes = [];
        if (Array.isArray(response))
            $scope.cdes = response;
    });


    $scope.saveProfile = function () {
        $timeout(function () {
            $http.post('/user/me', userResource.user).then(function (res) {
                if (res.status === 200) {
                    Alert.addAlert("success", "Saved");
                } else {
                    Alert.addAlert("danger", "Error, unable to save");
                }
            });
        }, 0);
    };
    userResource.getPromise().then(function () {
        if (userResource.user.username) {
            $scope.hasQuota = userResource.user.quota;
            $scope.orgCurator = userResource.user.orgCurator.toString().replace(/,/g, ', ');
            $scope.orgAdmin = userResource.user.orgAdmin.toString().replace(/,/g, ', ');
            $scope.getComments(1);
        }
    });

    $scope.getComments = function (page) {
        $http.get("/commentsFor/" + userResource.user.username + "/" + (page-1) * 30 + "/30").then(function(result) {
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

    $scope.getEltLink = function(c) {
        return {
            'cde': "/deview?tinyId=",
            'form': "/formView?tinyId=",
            'board': "/board/"
        }[c.element.eltType] + c.element.eltId;
    }

}]);