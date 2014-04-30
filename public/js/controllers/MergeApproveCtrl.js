function MergeApproveCtrl($scope, $window, DataElement, Mail, Classification) {
    $scope.approveMerge = function(message) {
        $scope.source = message.typeMergeRequest.source.object;
        $scope.destination = message.typeMergeRequest.destination.object;
        $scope.transferFields($scope.source, $scope.destination, 'naming');
        $scope.transferFields($scope.source, $scope.destination, 'attachments');
        $scope.transferFields($scope.source, $scope.destination, 'ids');
        $scope.transferFields($scope.source, $scope.destination, 'properties');        
        $scope.destination.version = parseInt($scope.destination.version)+1;
        DataElement.save($scope.destination, function(cde) {
            /////
            /*$scope.source.classification.map(function(classif){
                Classification.add({
                    classification: {
                        orgName: classif
                        , concept: classif.elements.elements.name
                        , conceptSystem: classif.elements.name                        
                    }
                    , deId: cde._id
                });
            });*/
            $scope.source.classification.map(function(stewardOrgClassifications) {
                var orgName = stewardOrgClassifications.stewardOrg.name;
                stewardOrgClassifications.elements.map(function(conceptSystem) {
                    var conceptSystemName = conceptSystem.name;
                    conceptSystem.elements.map(function(concept) {
                        var conceptName = concept.name;
                        Classification.add({
                            classification: {
                                orgName: orgName
                                , conceptSystem: conceptSystemName                      
                                , concept: conceptName                                
                            }
                            , deId: cde._id
                        });                        
                    });
                });
            });            
            /////
            message.typeMergeRequest.states.unshift({
                "action" : "Approved",
                "date" : new Date(),
                "comment" : ""
            });
            Mail.updateMessage(message, function() {
                $scope.addAlert("success", "The CDEs have been merged!");   
                $scope.fetchMRCdes();
            }, function () {
                $scope.addAlert("alert", "The merge operation failed!");        
            });
            
        });
    };
    
    $scope.transferFields = function(source, destination, type) {
        var fieldsTransfer = this;
        this.alreadyExists = function(obj) {
            delete obj.$$hashKey;
            return destination[type].map(function(obj) {return JSON.stringify(obj)}).indexOf(JSON.stringify(obj))>=0;
        };
        source[type].map(function(obj) {            
            if (fieldsTransfer.alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };      
    
    //$scope.transferClassifications = function
}
