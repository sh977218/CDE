var IdsCtrl = function ($scope, $modal, $http, DataElement) {
    $scope.openNewId = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newIdModalContent.html',
          controller: NewIdModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
        
        modalInstance.result.then(function (newId) {
            $scope.cde.ids.push(newId);
            DataElement.save($scope.cde, function(newCde) {
                $scope.cde = newCde;
                $scope.addAlert("success", "Identifier Added");
            });
        });
    };
    
    $scope.removeId = function (index) {
        $scope.cde.ids.splice(index, 1);
        DataElement.save($scope.cde, function(newCde) {
            $scope.cde = newCde;
            $scope.addAlert("success", "Identifier Removed");
        });        
    };
};

function NewIdModalCtrl($scope, $modalInstance, cde) {
    $scope.cde = cde;
    $scope.newId = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newId);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
