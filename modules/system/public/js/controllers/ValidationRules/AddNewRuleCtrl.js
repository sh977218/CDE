angular.module('systemModule').controller('AddNewRuleCtrl', ['$scope', '$uibModalInstance', 'userOrgs', function($scope, $modalInstance, userOrgs){
    $scope.fields = [
        'stewardOrg.name'
        , 'properties.key'
        , 'valueDomain.permissibleValues.codeSystemName'
        , 'valueDomain.permissibleValues.permissibleValue'
        , 'valueDomain.permissibleValues.valueMeaningName'
        , 'valueDomain.permissibleValues.valueMeaningCode'
        , 'version'
        , 'ids.version'
        , 'ids.source'
        , 'naming.context.contextName'
        , 'valueDomain.datatype'
        , 'source'
        , 'origin'

        , 'objectClass.concepts.name'
        , 'objectClass.concepts.origin'
        , 'objectClass.concepts.originId'

        , 'property.concepts.name'
        , 'property.concepts.origin'
        , 'property.concepts.originId'

        , 'dataElementConcept.concepts.name'
        , 'dataElementConcept.concepts.origin'
        , 'dataElementConcept.concepts.originId'

        , 'dataElementConcept.conceptualDomain.vsac.id'
        , 'dataElementConcept.conceptualDomain.vsac.name'
        , 'dataElementConcept.conceptualDomain.vsac.version'

        , 'valueDomain.uom'
        , 'valueDomain.ids.source'
        , 'valueDomain.ids.id'
        , 'valueDomain.ids.version'

        , 'referenceDocuments.referenceDocumentId'
        , 'referenceDocuments.document'
        , 'referenceDocuments.uri'
        , 'referenceDocuments.title'
    ];
    $scope.userOrgs = userOrgs;
    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.saveRule = function(){
        var msg = {
            occurence: $scope.occurence
            , targetStatus: $scope.targetStatus
            , ruleName: $scope.ruleName
            , rule: {regex: $scope.regex}
            , field: $scope.field
            , id: Math.random()
            , org: $scope.org
        };
        $modalInstance.close(msg);
    };
}]);