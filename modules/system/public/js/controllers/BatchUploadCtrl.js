angular.module('systemModule').controller('BatchUploadCtrl', ['$scope', '$http',
    function($scope, $http)
{

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

    $scope.$on('initBatchUpload', function() {
        $scope.loading = true;
        $http.get("/migrationCdeCount").then(function(response) {
            $scope.migrationCdeCount = response.data;
            $scope.loading = false;
        })

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