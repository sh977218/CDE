angular.module('cdeModule').controller('MergeModalCtrl', ['$scope', '$uibModalInstance', 'cdeSource', 'cdeTarget', 'user',
    function($scope, $modalInstance, cdeSource, cdeTarget, user) {
    $scope.source = cdeSource.data;
    $scope.target = cdeTarget.data;
    $scope.mergeRequest = {
        source: {tinyId: $scope.source.tinyId, object: $scope.source},
        destination: {tinyId: $scope.target.tinyId, object: $scope.target},
        mergeFields: {
            classifications: true,
            ids: false,
            naming: false,
            properties: false,
            attachments: false,
            sources: false,
            referenceDocuments: false,
            dataSets: false,
            derivationRules: false
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
    $scope.sendMergeRequest = function() {
        $modalInstance.close({mergeRequest:$scope.mergeRequest, recipient: $scope.target.stewardOrg.name, author: user.username, approval: $scope.approvalNecessary()});
    };
    $scope.showApprovalAlert = function() {
        return $scope.approvalNecessary().fieldsRequireApproval && !$scope.approvalNecessary().ownDestinationCde;
    };
    $scope.approvalNecessary = function() {
        return {
            fieldsRequireApproval: $scope.mergeRequest.mergeFields.ids || $scope.mergeRequest.mergeFields.naming || $scope.mergeRequest.mergeFields.properties || $scope.mergeRequest.mergeFields.attachments,
            ownDestinationCde: user.orgAdmin.concat(user.orgCurator).indexOf($scope.mergeRequest.destination.object.stewardOrg.name)>-1 
        };
    };
}
]);