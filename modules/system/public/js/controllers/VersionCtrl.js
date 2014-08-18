function VersionCtrl($scope, $modal) { 

    $scope.stageElt = function(elt) {
        elt.unsaved = true;
    };
    
    $scope.openSave = function (elt, redirectBaseLink) {
        $modal.open({
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
    };

}

