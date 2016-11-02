angular.module('cdeModule').controller('FormCdeCtrl',
    ['$scope', '$http', '$uibModal', 'CdeList', 'userResource',
        function ($scope, $http, $modal, CdeList, userResource) {
            $scope.includeInAccordion = ["/cde/public/html/accordion/pinAccordionActions.html",
                "/system/public/html/accordion/addToQuickBoardActions.html"];
            function getFormCdes() {
                CdeList.byTinyIdList($scope.formCdeIds, function (cdes) {
                    $scope.cdes = cdes;
                });
            }

            $scope.openPinModal = function (cde) {
                if (userResource.user.username) {
                    var modalInstance = $modal.open({
                        animation: false,
                        templateUrl: '/system/public/html/selectBoardModal.html',
                        controller: 'SelectCdeBoardModalCtrl'
                    });

                    modalInstance.result.then(function (selectedBoard) {
                        $http.put("/pin/cde/" + cde.tinyId + "/" + selectedBoard._id).then(function (response) {
                            if (response.status === 200) {
                                $scope.addAlert("success", response.data);
                            } else
                                $scope.addAlert("warning", response.data);
                        }, function (response) {
                            $scope.addAlert("danger", response.data);
                        });
                    }, function () {
                    });
                } else {
                    $modal.open({
                        animation: false,
                        templateUrl: '/system/public/html/ifYouLogInModal.html'
                    });
                }
            };

            $scope.$on('loadFormCdes', getFormCdes);
        }]);
