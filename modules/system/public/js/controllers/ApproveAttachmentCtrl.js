angular.module('systemModule').controller('ApproveAttachmentCtrl',
    ['$scope', '$http',
        function ($scope, $http) {
            $scope.approveAttachment = function (msg) {
                $http.get('/attachment/approve/' + msg.typeAttachmentApproval.fileid).success(function (data) {
                    $scope.addAlert("success", data);
                    $scope.closeMessage(msg);
                }).error(function (data) {
                    $scope.addAlert("danger", data);
                });
            };
            $scope.declineAttachment = function (msg) {
                $http.get('/attachment/decline/' + msg.typeAttachmentApproval.fileid).success(function (data) {
                    $scope.addAlert("success", data);
                    $scope.closeMessage(msg);
                }).error(function (data) {
                    $scope.addAlert("danger", data);
                });
            };

        }]);
