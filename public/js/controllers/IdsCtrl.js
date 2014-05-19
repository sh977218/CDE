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
            $http.post("/addId", {deId: $scope.cde._id, newId: newId}).success(function(data, status, headers, config) 
            {
                $scope.cde = data.de;
                $scope.addAlert("success", "Identifier Added");            
            }).error(function(data, status, headers, config) 
            {
                $scope.addAlert("danger", data.error);
            });
        });
    };
    
    $scope.removeId = function (index) {
        $http.post("/removeId", {deId: $scope.cde._id, index: index}).success(function(data, status, headers, config) {
            $scope.cde = data.de;
            $scope.addAlert("success", "Identifier Removed"); 
        }).error(function(data, status, headers, config) 
        {
            $scope.addAlert("danger", error);
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
