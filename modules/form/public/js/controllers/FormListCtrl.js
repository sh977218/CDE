angular.module('formModule').controller('FormListCtrl',
    ['$scope', '$http', 'FormQuickBoard', '$timeout', 'userResource', '$uibModal',
        function ($scope, $http, QuickBoard, $timeout, userResource, $modal) {

            $scope.quickBoard = QuickBoard;
            $scope.module = "form";

            $timeout(function () {
                $scope.search("form");
            }, 0);

            $scope.exporters.odm = {id: "odmExport", display: "ODM Export"};
            $scope.openPinModal = function (form) {
                if (userResource.user.username) {
                    $modal.open({
                        animation: false,
                        templateUrl: '/system/public/html/selectBoardModal.html',
                        controller: 'SelectBoardModalCtrl',
                        resolve: {type: function () {return 'form'}}
                    }).result.then(function (selectedBoard) {
                        $http.put("/pin/form/" + form.tinyId + "/" + selectedBoard._id).then(function (response) {
                            if (response.status === 200) {
                                $scope.addAlert("success", response.data);
                            } else
                                $scope.addAlert("warning", response.data);
                        }, function (response) {
                            $scope.addAlert("danger", response.data);
                        });
                    });
                } else {
                    $modal.open({
                        animation: false,
                        templateUrl: '/system/public/html/ifYouLogInModal.html'
                    });
                }
            };
        }]);
