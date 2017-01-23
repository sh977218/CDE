angular.module('cdeModule').controller('CdeCopyModalCtrl',
    ['$scope', 'elt', 'userResource', '$controller', '$uibModalInstance',
        function($scope, elt, userResource, $controller, $modalInstance) {

    elt.classification = elt.classification.filter(function (c) {
        return userResource.userOrgs.indexOf(c.stewardOrg.name) !== -1;
    });
    elt.registrationState.administrativeNote = "Copy of: " + elt.tinyId;
    delete elt.tinyId;
    delete elt._id;
    delete elt.source;
    elt.sources = [];
    delete elt.origin;
    delete elt.created;
    delete elt.updated;
    delete elt.imported;
    delete elt.updatedBy;
    delete elt.createdBy;
    delete elt.version;
    delete elt.history;
    delete elt.changeNote;
    delete elt.comments;
    delete elt.forkOf;
    delete elt.views;
    elt.ids = [];
    elt.registrationState.registrationStatus = "Incomplete";
    delete elt.registrationState.administrativeStatus;
    $scope.elt = JSON.parse(JSON.stringify(elt));
    $scope.origName = $scope.elt.naming[0].designation;
    $scope.elt.naming[0].designation = "Copy of: " + $scope.elt.naming[0].designation;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

    $scope.saveCopy = function(){
        $modalInstance.close();
        $scope.save();
    };

    $scope.isNameNew = function(){
        return $scope.origName !== $scope.elt.naming[0].designation;
    };

}]);