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
        xhr.addEventListener("load", uploadComplete, false);
        xhr.open("POST", "/migrationCdes" );
        xhr.send(fd);
    };

    function updateMigCde()
    {
        $scope.migrationCdeCount = "...";
        migUpdatePromise = $interval(function() {
            console.log("get migs");
            $http.get("/migrationCdeCount").then(function(response) {
                if ($scope.migrationCdeCount === response.data) $interval.cancel(migUpdatePromise);
                $scope.migrationCdeCount = response.data;
                $scope.loading = false;
            });
        }, 2000)
    }

    var migUpdatePromise;

    function initPage()  {
        $scope.loading = true;
        $http.get('/currentBatch').then(function(response) {
            $scope.currentBatch = response.data;
            if ($scope.currentBatch) updateMigCde();
            $scope.loading = false;
        });
    }

    $scope.$on('initBatchUpload', function() {
        initPage();
    });

    $scope.initBatch = function(type) {
        $http.post('/initBatch', {batchProcess: type}).then(function(response) {
            $scope.currentBatch = response.data;
        });
    };

    $scope.abortBatch = function() {
        $http.post('/abortBatch', {}).then(function () {
            delete $scope.currentBatch;
        });
    };

    $scope.beginMigration = function() {
        $http.post('/beginMigration', {}).then(function(response) {
            updateMigCde();
            $scope.currentBatch = response.data;
        });
    };

    $scope.loadOrg = function() {
        $http.post("/migrationOrg", JSON.parse($scope.migrationOrg)).then(function(result) {
            initPage();
        });
    };

    function uploadComplete() {
        updateMigCde();
    }

}]);