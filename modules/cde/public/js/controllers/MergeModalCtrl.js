angular.module('cdeModule').controller('MergeModalCtrl', ['$scope', '$uibModalInstance', 'cdeSource', 'cdeTarget', 'userResource',
    function ($scope, $modalInstance, cdeSource, cdeTarget, UserResource) {
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

    $scope.checkAllMergerFields = function () {
        $scope.mergeRequest.mergeFields.classifications = true;
        $scope.mergeRequest.mergeFields.ids = true;
        $scope.mergeRequest.mergeFields.naming = true;
        $scope.mergeRequest.mergeFields.properties = true;
        $scope.mergeRequest.mergeFields.attachments = true;
        $scope.mergeRequest.mergeFields.sources = true;
        $scope.mergeRequest.mergeFields.referenceDocuments = true;
        $scope.mergeRequest.mergeFields.dataSets = true;
        $scope.mergeRequest.mergeFields.derivationRules = true;
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };  
    $scope.sendMergeRequest = function() {
        $modalInstance.close({
            mergeRequest: $scope.mergeRequest,
            recipient: $scope.target.stewardOrg.name,
            author: UserResource.user.username,
            approval: $scope.approvalNecessary()
        });
    };
    $scope.showApprovalAlert = function() {
        return $scope.approvalNecessary().fieldsRequireApproval && !$scope.approvalNecessary().ownDestinationCde;
    };
    $scope.approvalNecessary = function() {
        return {
            fieldsRequireApproval: $scope.mergeRequest.mergeFields.ids
            || $scope.mergeRequest.mergeFields.naming
            || $scope.mergeRequest.mergeFields.properties
            || $scope.mergeRequest.mergeFields.attachments
            || $scope.mergeRequest.mergeFields.sources
            || $scope.mergeRequest.mergeFields.referenceDocuments
            || $scope.mergeRequest.mergeFields.dataSets
            || $scope.mergeRequest.mergeFields.derivationRules,
            ownDestinationCde: UserResource.user.orgAdmin.concat(UserResource.user.orgCurator).indexOf($scope.mergeRequest.destination.object.stewardOrg.name) > -1
        };
    };
}
]);