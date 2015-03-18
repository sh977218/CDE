angular.module('systemModule').controller('AttachmentsCtrl', ['$scope', '$rootScope', '$http', '$timeout', function($scope, $rootScope, $http, $timeout) {
    $scope.setFiles = function(element) {
        $scope.$apply(function($scope) {
          // Turn the FileList object into an Array
            $scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                if (element.files[i].size > (5 * 1024 * 1024) ) {
                    $scope.message = "Size is limited to 5Mb per attachment"; 
                } else {
                    $scope.files.push(element.files[i]);
                }
            }
          $scope.progressVisible = false;
        });
    };

    $scope.uploadFiles = function() {
        for (var i in $scope.files) {
            $scope.uploadFile($scope.files[i]);
        }
    };

    $scope.uploadFile = function(file) {
        var fd = new FormData();
        fd.append("id", $scope.elt._id);
        fd.append("uploadedFiles", file);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/attachments/" + $scope.module + "/add");
        $scope.progressVisible = true;
        xhr.send(fd);
    };

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            } else {
                $scope.progress = 'unable to compute';
            }
        });
    }

    function uploadComplete(evt) {
        $rootScope.$apply(function() {
            if (evt.target.status === 500) return $scope.addAlert("danger", evt.target.responseText);
            var resp = JSON.parse(evt.target.responseText);
            if (!resp.message) {
                $scope.elt = JSON.parse(evt.target.responseText);
                $scope.files = [];
                $scope.message = "";
            } else {
                $scope.message = resp.message;
            }
        });
    }

    function uploadFailed(evt) {
        // TODO
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        });
    }
    
    $scope.removeAttachment = function(index) {      
        $http.post("/attachments/" + $scope.module + "/remove", {
            index: index
            , id: $scope.elt._id 
        }).then(function (res) {
            $scope.elt = res.data;  
        });
    };
    
    $scope.setDefault = function(index) {
        if (!$scope.canCurate) return;
        $timeout(function () {
            $http.post("/attachments/" + $scope.module + "/setDefault", 
            {
                index: index
                , state: $scope.elt.attachments[index].isDefault
                , id: $scope.elt._id 
            }).then(function (res) {
                $scope.elt = res.data;
                $scope.addAlert("success", "Saved");
            });
        }, 0);
    };
}]);