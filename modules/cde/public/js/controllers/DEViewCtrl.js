angular.module('cdeModule').controller('DEViewCtrl', ['$scope', '$routeParams', '$http', 'AlertService',
    function ($scope, $routeParams, $http, Alert) {
        var tinyId = $routeParams.tinyId;
        var cdeId = $routeParams.cdeId;
        var url;
        if (tinyId) url = "/de/" + tinyId;
        if (cdeId) url = "/deById/" + cdeId;

        $http.get(url).then(function (response) {
            if (response.status === 200) {
                $scope.elt = response.data;
                $scope.eltLoaded = true;
            } else {
                Alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.");
                $scope.eltLoaded = true;
            }
        });


        $scope.$on('$locationChangeStart', function (event) {
            if ($scope.elt && $scope.elt.unsaved) {
                var txt = "You have unsaved changes, are you sure you want to leave this page? ";
                if (window.debugEnabled) {
                    txt = txt + window.location.pathname;
                }
                var answer = confirm(txt);
                if (!answer) {
                    event.preventDefault();
                }
            }
        });

        $scope.reloadDataElement = function () {
            $http.get("/de/" + $scope.elt.tinyId).then(function (response) {
                if (response.status === 200) {
                    $scope.elt = response.data;
                    Alert.addAlert("success", "Changes discarded.");
                } else Alert.addAlert("danger", "Sorry, we are unable to retrieve this data element." + response.error);
            });
        };

        $scope.stageDataElement = function () {
            $http.put("/de/" + $scope.elt.tinyId, $scope.elt).then(function (response) {
                if (response.status === 200) {
                    $scope.elt = response.data;
                    Alert.addAlert("success", "Data Element saved.");
                } else Alert.addAlert("danger", "Sorry, we are unable to retrieve this data element." + response.error);
            });
        };

    }]);