angular.module('systemModule').controller('BatchUploadCtrl', ['$scope', '$http', '$interval', '$upload',
    function($scope, $http, $interval, $upload)
{
    
    $scope.input = {};

    $scope.tabLostFocus = function() {
        console.log("lost foc");
    };

    $scope.uploadFile = function (file) {
        $upload.upload({
            url: '/migrationCdes',
            fields: {},
            file: file,
            fileFormDataName: "migrationJson"
        }).progress(function (evt) {
            $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total) + " %";
        }).then(function () {
            delete $scope.progressPercentage;
            $scope.addAlert("success", "Upload Complete");
            updateMigCde();
        });
    };

    function updateMigCde()
    {
        $scope.migrationCdeCount = "...";
        migUpdatePromise = $interval(function() {
            $http.get("/migrationCdeCount").then(function(response) {
                if ($scope.migrationCdeCount === response.data) $interval.cancel(migUpdatePromise);
                $scope.migrationCdeCount = response.data;
                $scope.loading = false;
            });
            $http.get('/currentBatch').then(function(response) {
                $scope.currentBatch = response.data;
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

    $scope.haltMigration = function() {
        $http.post('/haltMigration', {}).then(function(response) {
            updateMigCde();
            $scope.currentBatch = response.data;
        });
    };


    $scope.setValid = function() {
          try {
              JSON.parse($scope.input.migrationOrg);
              $scope.input.valid = true;
              delete $scope.input.error;
          } catch (e) {
              $scope.input.error = e.toString();
              $scope.input.valid = false;
          }
    };

    $scope.loadOrg = function() {
        $http.post("/migrationOrg", {org: JSON.parse($scope.input.migrationOrg)}).then(function(result) {
            initPage();
        });
    };

}]);