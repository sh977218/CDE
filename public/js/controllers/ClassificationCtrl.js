 function ClassificationCtrl($scope, $modal, Classification) {
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
              myOrgs: function () {
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
    };
    
    $scope.searchByClassification = function(orgName, elts) {
        $scope.cache.removeAll();
        $scope.cacheOrgFilter(orgName);
        $scope.cache.put("selectedElements", elts);
    };
 }
 