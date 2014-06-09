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
    
    $scope.searchByClassification = function(orgName, elts) {
        $scope.cache.removeAll();
        $scope.cacheOrgFilter(orgName);
        $scope.cache.put("selectedElements", elts);
    };    
     
    $scope.removeClassification = function(orgName, elts) {
        /*Classification.remove({
            orgName: orgName
            , elements: elts
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Classification Removed");
        });*/
        CdeClassification.remove({
            cdeId: $scope.cde._id
            , orgName: orgName
            , categories: elts
        }, function (res) {
            $route.reload();
            $scope.addAlert("success", "Classification Deleted");
        });
    };     
    
    /*$scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationModalCtrl,
          resolve: {
              myOrgs: function() {
                  return $scope.myOrgs;
              }   
          }          
        });
        modalInstance.result.then(function (newClassification) {
            Classification.add({
                classification: newClassification
                , deId: $scope.cde._id
            }, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.cde = res;
            });
        });
    };*/
   
 }
 