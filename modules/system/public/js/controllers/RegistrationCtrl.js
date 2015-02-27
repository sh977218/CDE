 systemModule.controller('RegistrationCtrl', ['$scope', '$modal', '$window', function($scope, $modal, $window) {   
     
    $scope.openRegStatusUpdate = function () {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/regStatusUpdateModal.html',
          controller: RegistrationModalCtrl,
          resolve: {
              elt: function() {
                  return $scope.elt;
              }
              , siteAdmin: function() {
                  return $scope.isSiteAdmin();
              }     
          }
        });

        modalInstance.result.then(function (newElt) {
            $window.location.href = $scope.baseLink + newElt._id;  
            $scope.addAlert("success", "Saved");
         }, function () {
             $scope.revert($scope.elt);
        });                    
    };
    
 }
 ]);