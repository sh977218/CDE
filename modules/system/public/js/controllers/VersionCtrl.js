function VersionCtrl($scope, $modal, $window) { 

    $scope.stageElt = function(elt) {
        elt.unsaved = true;
    };
    
    $scope.openSave = function (elt, redirectBaseLink) {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/saveModal.html',
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
        modalInstance.result.then(function (newelt) {
            $window.location.href = redirectBaseLink + newelt._id;  
            $scope.addAlert("success", "Saved.");
        });        
    };

}

