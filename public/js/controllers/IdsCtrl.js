var IdsCtrl = function ($scope, $modal, $http) {
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
            $http.post("/addId", {deId: $scope.cde._id, newId: newId}).then(function(result) {
                if (result.data.error !== undefined) {
                    $scope.addAlert("danger", result.data.error);
                } else {
                    $scope.cde = result.data.de;
                    $scope.addAlert("success", "Identifier Added");
                }
            });
        });
    };
    
    $scope.removeId = function (index) {
        $http.post("/removeId", {deId: $scope.cde._id, index: index}).then(function(result) {
            $scope.cde = result.data.de;
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
