 function ClassificationCtrl($scope, $modal, $route, Classification) {
    $scope.initCache(); 
     
    $scope.removeClassification = function(orgName, elts) {
        Classification.remove({
            orgName: orgName
            , elements: elts
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
            $scope.addAlert("success", "Classification Removed");
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
            //TO-DO: Ability to classify as any organization in the list.
            newClassification.orgName = $scope.user.orgCurator[0]?$scope.user.orgCurator[0]:$scope.user.orgAdmin[0];
            Classification.add({
                classification: newClassification
                , deId: $scope.cde._id
            }, function (res) {
                $scope.addAlert("success", "Classification Added");
                $scope.cde = res;
            });
        });
    };
    
    $scope.searchByClassification = function(orgName, elts) {
        $scope.cache.removeAll();
        $scope.cacheOrgFilter(orgName);
        $scope.cache.put("selectedElements", elts);
    };
 }
 