 function ClassificationCtrl($scope, $modal, $routeParams, CdeClassification) {
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
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            CdeClassification.save(newClassification, function(res) {
                                newClassification.categories.pop();    
                                $scope.addAlert("success", res.msg);                                
                            });                   
                        }
                    };
                }
            }          
        });

        modalInstance.result.then(function () {
            $scope.reload($routeParams);
        });
    };    
     
    $scope.removeClassification = function(orgName, elts) {
        CdeClassification.remove({
            cdeId: $scope.cde._id
            , orgName: orgName
            , categories: elts
        }, function (res) {
            $scope.reload($routeParams);
            $scope.addAlert("success", "Classification Deleted");
        });
    };     
  
 }
 