 function ClassificationCtrl($scope, $modal, $route, Classification) {
    $scope.initCache(); 
     
    $scope.removeClassification = function(orgName, conceptSystemName, conceptName) {
        Classification.remove({
            orgName: orgName
            , conceptSystemName: conceptSystemName
            , conceptName: conceptName
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Classification Removed");
            $route.reload();
        });
    };     
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'addClassificationModalContent.html',
          controller: AddClassificationModalCtrl,
          resolve: {
          }
        });

        modalInstance.result.then(function (newClassification) {
            newClassification.orgName = $scope.user.orgCurator[0];
            Classification.add({
                classification: newClassification
                , deId: $scope.cde._id
            }, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.cde = res;
                $route.reload();
            });
        });
    };
    
    $scope.searchByClassification = function(orgName, systemName, conceptName) {
        $scope.cache.removeAll();
        $scope.cacheOrgFilter(orgName); 
        $scope.cacheSubGroup({term:conceptName});
        $scope.cacheGroup({name:systemName});
    };
 }
 