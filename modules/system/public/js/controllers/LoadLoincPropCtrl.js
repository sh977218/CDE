angular.module('systemModule').controller('LoadLoincPropCtrl', function ($scope, $rootScope, $interval, $http, $timeout) {
    $scope.status = {};
    $scope.setFile = function(file){
        $scope.$apply(function ($scope) {
            var f = file.files[0];
            if (f.name !== 'loinc.csv') return $scope.status.error = 'This is not loinc.csv';
            else {$scope.status.error = null;}
            $scope.loincCsv = f;
        });
    };

    $scope.uploadLoincCsv = function () {
        var fd = new FormData();
        fd.append("uploadedFiles", $scope.loincCsv);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.open("POST", "/uploadLoincCsv");
        xhr.send(fd);
        $scope.status.progress = "Loinc fields update in progress.";
        var i = $interval(function(){
            $http.get('/uploadLoincCsvStatus').success(function(data){
                $scope.output = data;
            });
        }, 1000);
        $timeout(function(){
            $interval.cancel(i);
        }, 60000);
    };

    function uploadProgress(evt) {
        $scope.$apply(function () {
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            }
        });
    }

    function uploadComplete(evt) {
        $rootScope.$apply(function () {
            $scope.status.progress = null;
            if (evt.target.status !== 200) $scope.status = {error: "Cannot upload loinc.csv"};
            else $scope.status = {success: "Loinc CSV uploaded. Parsing."}
        });
    }

    function uploadFailed(evt) {
        $scope.status.progress = null;
        $rootScope.$apply(function () {
            $scope.status.error = "Loinc load failed."
        });
    }
});