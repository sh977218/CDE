var PropertiesCtrl = function ($scope, $modal, $http) {
    $scope.openNewProperty = function () {
        var modalInstance = $modal.open({
          templateUrl: 'newPropertyModalContent.html',
          controller: NewPropertyModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
        
        modalInstance.result.then(function (newProperty) {
            $http.post("/addProperty", {deId: $scope.cde._id, property: newProperty}).then(function(result) {
                if (result.data.error !== undefined) {
                    $scope.addAlert("danger", result.data.error);
                } else {
                    $scope.cde = result.data.de;
                    $scope.addAlert("success", "Property Added");
                }
            });
        });
    };
    
    $scope.removeProperty = function (index) {
        $http.post("/removeProperty", {deId: $scope.cde._id, index: index}).then(function(result) {
            $scope.cde = result.data.de;
            $scope.addAlert("success", "Property Removed"); 
        });
    };


};

function NewPropertyModalCtrl($scope, $modalInstance, cde) {
    $scope.cde = cde;
    $scope.newProperty = {};

    $scope.okCreate = function () {
        $modalInstance.close($scope.newProperty);
    };    
    
    $scope.cancelCreate = function() {
        $modalInstance.dismiss("Cancel");
    };
};
