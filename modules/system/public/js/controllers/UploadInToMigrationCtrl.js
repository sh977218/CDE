angular.module('systemModule').controller('UploadInToMigrationCtrl', ['$scope', '$http', '$interval', '$upload',
    function ($scope, $http, $interval, $upload) {

        $scope.collections = ['NINDS', 'test'];

        $scope.selectCollection = function (c) {
            $scope.collection = c;
        };

        $scope.uploadFile = function (file) {
            if (!$scope.collection) {
                $scope.error = "unknown collection.";
                return;
            }
            $upload.upload({
                url: '/uploadInToMigration',
                fields: {collection: $scope.collection},
                file: file,
                fileFormDataName: "migrationBsonJson"
            }).progress(function (evt) {
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total) + " %";
            }).success(function (data, status, headers, config) {
                delete $scope.progressPercentage;
                $scope.addAlert("success", "Upload Complete");
            });
            updateMigrationInfo($scope.collection);
        };

        var migUpdatePromise;

        function updateMigrationInfo(c) {
            $scope.migrationCount = "...";
            $http.get("/migrationCount/" + c).then(function (response) {
                if ($scope.migrationCdeCount === response.data) $interval.cancel(migUpdatePromise);
                $scope.migrationCount = response.data;
            });
        }
    }]);