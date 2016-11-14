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
            $http.get("/commentsFor/" + userResource.user.username + "/0/30").then(function(result) {
               $scope.latestComments = result.data;
            });
        }
    });

    $scope.getEltLink = function(c) {
        return {
            'cde': "/deview?tinyId=",
            'form': "/formView?tinyId=",
            'board': "/board?_id="
        }[c.element.eltType] + c.element.eltId;
    }

}]);