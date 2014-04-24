 function UsedByCtrl($scope, $modal, UsedBy) {
    $scope.removeUsedBy = function(usedBy) {
        UsedBy.remove({
            usedBy: usedBy
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Usage Removed");
        });
    };
    
    $scope.openAddUsedByModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addUsedByModalContent.html',
          controller: AddUsedByModalCtrl,
          resolve: {
          }
        });

        modalInstance.result.then(function (newUsedBy) {
            UsedBy.add({
                usedBy: newUsedBy
                , deId: $scope.cde._id
            }, function (res) {
                $scope.addAlert("success", "Usage Added");
                $scope.cde.usedByOrgs.push(newUsedBy);
                $scope.cde = res;
            });
        });
    };
 }
 