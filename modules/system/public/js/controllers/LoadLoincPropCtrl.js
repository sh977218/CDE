angular.module('systemModule').controller('LoadLoincPropCtrl', function ($scope, $upload) {
    $scope.setFile = function(file){
        $scope.$apply(function ($scope) {
            var f = file.files[0];
            if (f.name !== 'loinc.csv') $scope.addAlert('This is not loinc.csv');
            $scope.loincCsv = f;
        });
    };

    $scope.uploadLoincCsv = function () {
        var fd = new FormData();
        fd.append("uploadedFiles", $scope.loincCsv);
        var xhr = new XMLHttpRequest();
        //xhr.upload.addEventListener("progress", uploadProgress, false);
        //xhr.addEventListener("load", uploadComplete, false);
        //xhr.addEventListener("error", uploadFailed, false);
        //xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/uploadLoincCsv");
        xhr.send(fd);
    };
});