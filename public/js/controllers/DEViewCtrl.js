function DEViewCtrl($scope, $routeParams, $window, $http, $timeout, DataElement, PriorCdes, CdeDiff, CdeList) {
    $scope.initialized = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.mltCdes = [];
    $scope.boards = [];
    $scope.comment = {};
    $scope.pVTypeheadVsacNameList = [];
    $scope.pVTypeaheadCodeSystemNameList = [];
    
    $scope.reload = function(route, cb) {
        if (route.cdeId) var query = {deId: route.cdeId, type: '_id'};
        if (route.uuid) var query = {deId: route.uuid, type: 'uuid'};
        DataElement.get(query, function (de) {
           $scope.cde = de;          
           $scope.loadValueSet();
           $scope.initialized = true;
           $scope.canLinkPvFunc();
           $scope.loadMlt();
           $scope.loadBoards();      
           $scope.getPVTypeaheadCodeSystemNameList(); 
            PriorCdes.getCdes({cdeId: de._id}, function(dataElements) {
                $scope.priorCdes = dataElements;
            });                
        });       
    };
    
    $scope.reload($routeParams);

    var indexedConceptSystemClassifications = [];
    $scope.classificationToFilter = function() {
         indexedConceptSystemClassifications = [];
         if ($scope.cde != null) {
             return $scope.cde.classification;
         } 
    };

    $scope.isInConceptSystem = function(system) {
        return function(classi) {
            return classi.conceptSystem === system;
        };
    };

    $scope.isAllowedNonCuration = function (cde) {
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if ($scope.initialized && $scope.myOrgs) {
                return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
            } else {
                return false;
            }
        }

    };
    

   
    $scope.save = function() {
        $scope.cde.$save(function (cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;
        });
    }; 
    
    $scope.revert = function(cde) {
        $scope.reload({cdeId: cde._id});
    };
    
    $scope.viewDiff = function (cde) {
        var dmp = new diff_match_patch();
        
        CdeDiff.get({deId: cde._id}, function(diffResult) {
            $scope.diff = {};
            if (diffResult.before.name) {
                var d = dmp.diff_main(diffResult.before.name, diffResult.after.name);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.name = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.definition) {
                var d = dmp.diff_main(diffResult.before.definition, diffResult.after.definition);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.definition = dmp.diff_prettyHtml(d);
            }            
            if (diffResult.before.version) {
                $scope.diff.version = "Before: " + diffResult.before.version + " -- After: " + diffResult.after.version;
            }
            if (diffResult.before.datatype || diffResult.after.datatype) {
                $scope.diff.datatype = "Before: " + diffResult.before.datatype + " -- After: " + diffResult.after.datatype;
            }
            if (diffResult.before.uom) {
                var d = dmp.diff_main(diffResult.before.uom, diffResult.after.uom);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.uom = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.permissibleValues || diffResult.after.permissibleValues) {
                $scope.diff.permissibleValues = "Modified";
            }
        });
    };
    
    $scope.isPvInVSet = function(pv, callback) {
            for (var i = 0; i < $scope.vsacValueSet.length; i++) {
                if (pv.valueMeaningCode == $scope.vsacValueSet[i].code && 
                    pv.codeSystemName == $scope.vsacValueSet[i].codeSystemName &&
                    pv.valueMeaningName == $scope.vsacValueSet[i].displayName) {
                        return callback(true);
                }
            }
            return callback(false);
    };
    
    $scope.validatePvWithVsac = function() {
        var pvs = $scope.cde.valueDomain.permissibleValues;
        if (!pvs) {
            return;
        }
        for (var i = 0; i < pvs.length; i++) {
           $scope.isPvInVSet(pvs[i], function(wellIsIt) {
                pvs[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.runManualValidation = function () {
        delete $scope.showValidateButton;
        $scope.validatePvWithVsac();
        $scope.validateVsacWithPv();
    };
    
    $scope.runDelayedManualValidation = function() {
        $timeout(function(){
            $scope.runManualValidation();
        },100);
    };
       
    $scope.isVsInPv = function(vs, callback) {
        var returnVal = function(value){
            if (callback) {
                return callback(value);
            } else {
                return value;
            }
        };
        var pvs = $scope.cde.valueDomain.permissibleValues;
        if (!pvs) {
            return returnVal(false);       
        }
        for (var i = 0; i < pvs.length; i++) {
            if (pvs[i].valueMeaningCode === vs.code && 
                pvs[i].codeSystemName === vs.codeSystemName &&
                pvs[i].valueMeaningName === vs.displayName) {
                    return returnVal(true);
            }
        }
        return returnVal(false);
    };    
    
    $scope.validateVsacWithPv = function() {
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
           $scope.isVsInPv($scope.vsacValueSet[i], function(wellIsIt) {
                $scope.vsacValueSet[i].isValid = wellIsIt;
           });
        }
    };
    
    $scope.allVsacMatch = function () {
        var allVsacMatch = true;
        for (var i = 0; i < $scope.vsacValueSet.length; i++) {
            allVsacMatch = allVsacMatch && $scope.vsacValueSet[i].isValid;
        }
        return allVsacMatch;
    };
    
    $scope.loadValueSet = function() {
        var dec = $scope.cde.dataElementConcept;
        if (dec != null && dec.conceptualDomain != null && dec.conceptualDomain.vsac !=  null) {
            $scope.vsacValueSet = [];
            $http({method: "GET", url: "/vsacBridge/" + dec.conceptualDomain.vsac.id}).
             error(function(data, status) {
                if (status === 404) {
                   $scope.addAlert("warning", "Invalid VSAC OID");
                   $scope.cde.dataElementConcept.conceptualDomain.vsac.id = "";                 
                } else { 
                   $scope.addAlert("danger", "Error quering VSAC");
                   $scope.cde.dataElementConcept.conceptualDomain.vsac.id = "";
                }
             }).
             success(function(data, status) {
                if (data === "") {
                } else {
                    $scope.cde.dataElementConcept.conceptualDomain.vsac.name = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                    $scope.cde.dataElementConcept.conceptualDomain.vsac.version = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].version;
                    for (var i = 0; i < data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                        $scope.vsacValueSet.push(data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$']);
                    }
                    if ($scope.vsacValueSet.length < 50 || $scope.cde.valueDomain.permissibleValues < 50) {
                        $scope.validatePvWithVsac();
                        $scope.validateVsacWithPv();
                    } else {
                        $scope.showValidateButton = true;
                    }
                    $scope.getPVTypeheadVsacNameList();                   
                }
             })
             ;
        }
        $scope.canLinkPvFunc();
    };
    
    // could prob. merge this into load value set.
    $scope.canLinkPvFunc = function() {
        var dec = $scope.cde.dataElementConcept;
        $scope.canLinkPv = ($scope.isAllowed($scope.cde) &&
                dec != null &&
                dec.conceptualDomain != null &&
                dec.conceptualDomain.vsac != null &&
                dec.conceptualDomain.vsac.id != null);
    };   
    
    $scope.loadMlt = function() {
        $http({method: "GET", url: "/moreLikeCde/" + $scope.cde._id}).
             error(function(data, status) {
             }).
             success(function(data, status) {
                 $scope.mltCdes = data.cdes;
             })
        ;
    };
    
    $scope.loadBoards = function() {
        $http.get("/deBoards/" + $scope.cde.uuid).then(function(response) {
            $scope.boards = response.data;
        });
    };
    
    $scope.getPVTypeheadVsacNameList = function() {
        $scope.pVTypeheadVsacNameList =  $scope.vsacValueSet.map(function(obj) {
            return obj.displayName;
        });       
    };    
    
    $scope.getPVTypeaheadCodeSystemNameList = function() {
        $http.get("/permissibleValueCodeSystemList").then(function(response) {
            $scope.pVTypeaheadCodeSystemNameList = response.data;
        });
    }; 
}
