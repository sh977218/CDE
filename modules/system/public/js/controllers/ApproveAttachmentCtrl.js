<<<<<<< HEAD
angular.module('systemModule').controller('ApproveAttachmentCtrl', ['$scope', '$http', 'Mail', '$uibModal',
    function($scope, $http, Mail, $modal) {

    $scope.approveAttachment = function(msg) {
        $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };
    $scope.declineAttachment = function(msg) {
        $http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).
            success(function(data, status, headers, config) {
                $scope.addAlert("success", data);
                $scope.closeMessage(msg);
            }).
            error(function(data, status, headers, config) {
                $scope.addAlert("danger", data);
            });
    };    
        
}]);
=======
angular.module('systemModule').controller('ApproveAttachmentCtrl',
    ['$scope', '$http', 'Mail', '$uibModal',
        function ($scope, $http) {
            $scope.approveAttachment = function (msg) {
                $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).success(function (data, status, headers, config) {
                    $scope.addAlert("success", data);
                    $scope.closeMessage(msg);
                }).error(function (data, status, headers, config) {
                    $scope.addAlert("danger", data);
                });
            };
            $scope.declineAttachment = function (msg) {
                $http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).success(function (data, status, headers, config) {
                    $scope.addAlert("success", data);
                    $scope.closeMessage(msg);
                }).error(function (data, status, headers, config) {
                    $scope.addAlert("danger", data);
                });
            };

        }]);
>>>>>>> 1efa25f5b58b5c8c0ceec880c416dba78b7d8def
