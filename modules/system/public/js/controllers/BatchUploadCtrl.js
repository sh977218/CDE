angular.module('systemModule').controller('BatchUploadCtrl', ['$scope', '$http', '$interval',
    function($scope, $http, $interval)
{

    $scope.tabLostFocus = function() {
        console.log("lost foc");
    };

    $scope.uploadFile = function (file) {
        var fd = new FormData();
        fd.append("migrationJson", file);
        var xhr = new XMLHttpRequest();
        //xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/loadMigrationCdes" );
        //$scope.progressVisible = true;
        xhr.send(fd);
    };

    var migUpdatePromise;

    $scope.$on('initBatchUpload', function() {
        $scope.loading = true;
        migUpdatePromise = $interval(function() {
            console.log("get migs");
            $http.get("/migrationCdeCount").then(function(response) {
                if ($scope.migrationCdeCount === response.data) migUpdatePromise.cancel();
                $scope.migrationCdeCount = response.data;
                $scope.loading = false;
            });
        }, 2000)
    });

    function uploadFailed() {
    }

    function uploadCanceled() {
        $scope.$apply(function () {
            $scope.progressVisible = false;
        });
    }

    function uploadComplete(evt) {

    }

}]);