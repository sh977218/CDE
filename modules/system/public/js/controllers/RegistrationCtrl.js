 angular.module('systemModule').controller('RegistrationCtrl', ['$scope', '$modal', '$location',
     function($scope, $modal, $location)
 {
     
    $scope.openRegStatusUpdate = function () {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/regStatusUpdateModal.html',
          controller: 'RegistrationModalCtrl',
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
            $location.url($scope.baseLink + newElt.tinyId);
            $scope.addAlert("success", "Saved");
         }, function () {
             $scope.revert($scope.elt);
        });                    
    };
    
 }
 ]);