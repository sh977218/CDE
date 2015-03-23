angular.module('systemModule').controller('VersionCtrl', ['$scope', '$modal', '$window', 'userResource', function($scope, $modal, $window, userResource) { 

    $scope.stageElt = function(elt) {
        elt.unsaved = true;
    };
    
    $scope.openSave = function (elt, redirectBaseLink) {
        var modalInstance = $modal.open({
          templateUrl: '/system/public/html/saveModal.html',
          controller: 'SaveModalCtrl',
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
            $scope.elt = newelt;
            if ($scope.elt.history && $scope.elt.history.length>0) $scope.loadPriorCdes();
            $scope.addAlert("success", "Saved.");
        }, function(reason) {
            $scope.addAlert("danger", reason);
        });        
    };

}

]);