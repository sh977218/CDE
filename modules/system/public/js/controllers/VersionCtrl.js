function VersionCtrl($scope, $modal, $window, userResource) { 

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
                  return userResource.user;
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

