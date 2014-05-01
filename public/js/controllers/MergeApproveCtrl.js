function MergeApproveCtrl($scope, $window, $interval,  DataElement, Mail, Classification) {
    $scope.approveMerge = function(message) {
        $scope.source = message.typeMergeRequest.source.object;
        $scope.destination = message.typeMergeRequest.destination.object;
        Object.keys(message.typeMergeRequest.fields).map(function(field) {
            if (message.typeMergeRequest.fields[field]) {
                $scope.transferFields($scope.source, $scope.destination, field);
            }
        });
        $scope.destination.version = parseInt($scope.destination.version)+1;
        $scope.nrDefinitions = 0;
        DataElement.save($scope.destination, function(cde) {
            $scope.transferClassifications(cde);
            var intervalHandle = $interval(function() {
                if ($scope.nrDefinitions === 0) {
                    $interval.cancel(intervalHandle);
                    $scope.retireSource($scope.source, $scope.destination, function() {
                        $scope.closeMessage(message);
                    });                     
                }
            }, 100, 20);            
        });
    };
    
    $scope.closeMessage = function(message) {
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
    };
    
    $scope.transferFields = function(source, destination, type) {
        if (!source[type]) return;
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
    
    $scope.transferClassifications = function (target) {
        $scope.source.classification.map(function(stewardOrgClassifications) {
            var orgName = stewardOrgClassifications.stewardOrg.name;
            stewardOrgClassifications.elements.map(function(conceptSystem) {
                var conceptSystemName = conceptSystem.name;
                conceptSystem.elements.map(function(concept) {
                    var conceptName = concept.name;
                    $scope.nrDefinitions++;
                    Classification.add({
                        classification: {
                            orgName: orgName
                            , conceptSystem: conceptSystemName                      
                            , concept: conceptName                                
                        }
                        , deId: target._id
                    }, function() {
                        $scope.nrDefinitions--;
                    });
                });
            });
        });          
    };
    
    $scope.retireSource = function(source, destination, cb) {
        source 
        if (cb) cb();
    };     
}
