 function RegistrationCtrl($scope, $modal) {
     
    $scope.openRegStatusUpdate = function (elt, redirectBaseLink) {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/regStatusUpdateModal.html',
          controller: SaveModalCtrl,
          resolve: {
              elt: function() {
                  return elt;
              }
              , user: function() {
                  return $scope.user;
              }     
              , redirectBaseLink: function() {
                  return redirectBaseLink;
              }
          }
        });

        modalInstance.result.then(function () {
            $scope.addAlert("success", "Saved");
         }, function () {
        });        
    };
 }
 