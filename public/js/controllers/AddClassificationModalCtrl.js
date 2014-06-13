 function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, CdeClassification, myOrgs, cde, addAlert) {
    $scope.classificationType = "cde";
    $scope.myOrgs = myOrgs; 
    $scope.newClassification = { orgName: myOrgs[0], categories: [], cdeId: cde._id };
    $scope.classTree = ClassificationTree;
    
    $scope.selectOrg = function(name) {
        ClassificationTree.wipeRest($scope.newClassification, 0);
        Organization.getByName(name, function(result) {
             $scope.org = result.data;
        });          
    };
    $scope.selectOrg($scope.newClassification.orgName);
    $scope.$watch('newClassification.orgName', function() {$scope.selectOrg($scope.newClassification.orgName);}, true);
     
    $scope.close = function () {
        $modalInstance.close();
    };
    
    $scope.addClassification = function (lastLeafName, event) {
        $scope.newClassification.categories.push(lastLeafName);
        CdeClassification.save($scope.newClassification, function(res,x) {

        }).$promise.then(
            function(res) {
                $scope.newClassification.categories.pop();            
                addAlert("success", "Classification Added");                 
            },
            function(res){
                $scope.newClassification.categories.pop();            
                addAlert("warning", res.data); 
        });     
    };    
}
