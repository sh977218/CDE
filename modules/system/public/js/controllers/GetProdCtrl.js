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
                $scope.restoreStatus = {progress: true, success: false, danger: false};
                $http.post('/api/reloadProd', {url: $scope.sourceUrl}).success(function(){
                    $scope.addAlert("success", "Data has been reloaded.");
                    $scope.restoreStatus = {progress: false, success: true, danger: false};
                });
                $scope.addAlert("warning", "Data is being reloaded.");
            }, function() {
                $scope.restoreStatus = {progress: false, success: false, danger: true};
            });
        };
        $scope.sourceUrl = window.prodDumpUrl;
        $scope.restoreStatus = {progress: false, success: false, danger: false};
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

