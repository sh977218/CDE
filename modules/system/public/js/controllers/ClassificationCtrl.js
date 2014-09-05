 function ClassificationCtrl($scope, $modal, $routeParams, CdeClassification) {
    $scope.module = "cde";
     
    $scope.initCache(); 
    
    $scope.openAddClassificationModal = function () {
        var modalInstance = $modal.open({
          templateUrl: '/template/system/addClassification',
          controller: AddClassificationModalCtrl,
          resolve: {
                myOrgs: function() {
                    return $scope.myOrgs;
                }
                , cde: function() {
                    return $scope.elt;
                }
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            CdeClassification.save(newClassification, function(res) {
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
            cdeId: $scope.elt._id
            , orgName: orgName
            , categories: elts
        }, function (res) {
            $scope.reload($routeParams);
            $scope.addAlert("success", "Classification Deleted");
        });
    };     
  
 }
 