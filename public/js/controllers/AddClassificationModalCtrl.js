//<<<<<<< HEAD
 function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, myOrgs, cde, addClassification) {
//=======
//function AddClassificationModalCtrl($scope, $modalInstance, ClassificationTree, Organization, CdeClassification, myOrgs, cde, addAlert) {
//>>>>>>> 0a6cec65667ecb6da471f0b5ba07c638c47f7cc5
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
        /*CdeClassification.save($scope.newClassification, function(res) {
            $scope.newClassification.categories.pop();    
            addAlert("success", res.msg);                                
        });*/
        addClassification.addClassification($scope.newClassification);
    };    
}
