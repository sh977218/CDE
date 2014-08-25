 function RegistrationCtrl($scope, $modal, $window) {
     
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

        modalInstance.result.then(function (cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;        
            $scope.addAlert("success", "Saved");
         }, function () {
        });        
    };
 }
 