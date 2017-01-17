angular.module('systemModule').controller('GetProdCtrl', ['$scope', '$uibModal', '$http',
    function($scope, $modal, $http)
    {
        $scope.getProdModal = function(){
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: '/system/public/html/getProdModal.html',
                controller: [function(){}],
                resolve: {
                }
            });
            modalInstance.result.then(function (includeAll) {
                $scope.restoreStatus = "progress";
                $http.post('/api/reloadProd', {url: $scope.sourceUrl, includeAll: includeAll}).then(function onSuccess(){
                    $scope.addAlert("success", "Data has been reloaded.");
                    $scope.restoreStatus = "success";
                });
                $scope.addAlert("warning", "Data is being reloaded.");
            }, function() {
                $scope.restoreStatus = "danger";
            });
        };
        $scope.sourceUrl = window.prodDumpUrl;
        $scope.restoreStatus = "";
    }
]);

