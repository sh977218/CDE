angular.module('systemModule').controller('UploadInToMigrationCtrl', ['$scope', '$http', '$interval', '$upload',
    function ($scope, $http, $interval, $upload) {

        $scope.collection = '';
        $scope.collections = ['NINDS', 'test'];

        $scope.selectCollection = function (c) {
            $scope.collection = c;
        };

        $scope.uploadFile = function (file) {
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
        };

    }]);