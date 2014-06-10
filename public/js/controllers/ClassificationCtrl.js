 function ClassificationCtrl($scope, $modal, $route, CdeClassification) {
    $scope.initCache(); 
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationModalCtrl,
          resolve: {
              myOrgs: function() {
                  return $scope.myOrgs;
              }
              , cde: function() {
                  return $scope.cde;
              }
              , addAlert: function() {
                  return $scope.addAlert;
              }
          }          
        });

        modalInstance.result.then(function () {
            $route.reload();
        });
    };    
     
    $scope.removeClassification = function(orgName, elts) {
        CdeClassification.remove({
            cdeId: $scope.cde._id
            , orgName: orgName
            , categories: elts
        }, function (res) {
            $route.reload();
            $scope.addAlert("success", "Classification Deleted");
        });
    };     
  
 }
 