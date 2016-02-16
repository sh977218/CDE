angular.module('systemModule').controller('GetProdCtrl', ['$scope', '$uibModal', '$http',
    function($scope, $modal, $http)
    {
        $scope.getProdModal = function(){
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/getProdModal.html',
                controller: 'GetProdModalCtrl',
                resolve: {
                }
            });
            modalInstance.result.then(function () {
                $scope.restoreInProgress = true;
                $http.post('/api/reloadProd', {url: $scope.sourceUrl}).success(function(){
                    $scope.addAlert("success", "Data has been reloaded.");
                    $scope.restoreInProgress = false;
                });
                $scope.addAlert("warning", "Data is being reloaded.");
            }, function(reason) {

            });
        };
        $scope.sourceUrl = window.prodDumpUrl;
        $scope.restoreInProgress = false;
    }
]);

angular.module('systemModule').controller('GetProdModalCtrl', ['$scope', '$uibModalInstance',
    function($scope, $modalInstance)
    {
        $scope.yes = function(){
            $modalInstance.close();
        };
        $scope.no = function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);

