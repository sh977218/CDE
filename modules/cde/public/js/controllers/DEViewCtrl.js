function DEViewCtrl($scope, $routeParams, $window, $http, $timeout, DataElement, DataElementUUID, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.detailedView = true;
    $scope.canLinkPv = false;
    $scope.vsacValueSet = [];
    $scope.mltCdes = [];
    $scope.boards = [];
    $scope.comment = {};
    $scope.pVTypeheadVsacNameList = [];
    $scope.pVTypeaheadCodeSystemNameList = [];
    $scope.pvLimit = 30;
    
    $scope.showValidationIcons = false;
    
    $scope.tabs = [
        {heading: "General Details"},
        {heading: "Permissible Values"},
        {heading: "Naming"},
        {heading: "Classification"},
        {heading: "Concepts"},
        {heading: "Status"},
        {heading: "Properties"},
        {heading: "Identifiers"},
        {heading: "Discussions"},
        {heading: "Boards"},
        {heading: "Attachments"},
        {heading: "More Like This"},
        {heading: "History"}
    ];
    
    $scope.$watch('cde', function() {
        $scope.elt = cde;        
    });
    
    $scope.reload = function(route, cb) {
        var service = DataElement;
        if (route.cdeId) var query = {deId: route.cdeId};
        if (route.uuid) {
            service = DataElementUUID;
            var query = {uuid: route.uuid};
            if (route.version) query.version = route.version;
        }
        service.get(query, function (de) {
           $scope.cde = de;          
           $scope.loadValueSet();
           $scope.canLinkPvFunc();
           $scope.loadMlt();
           $scope.loadBoards();
           $scope.showValidationIcons = $scope.cde.dataElementConcept.conceptualDomain != null && $scope.cde.dataElementConcept.conceptualDomain.vsac.id != null;
           $scope.getPVTypeaheadCodeSystemNameList(); 
            PriorCdes.getCdes({cdeId: de._id}, function(dataElements) {
                $scope.priorCdes = dataElements;
            });                
           $scope.initialized = true;
        });
        if (route.tab) {
            $scope.tabs[route.tab].active = true;
        }
    };
    
    $scope.reload($routeParams);

    $scope.classificationToFilter = function() {
         if ($scope.cde != null) {
             return $scope.cde.classification;
         } 
    };

    $scope.isAllowedNonCuration = function (cde) {
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user && $scope.user.siteAdmin) {
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

    $scope.compareLists = function(listA, listB) {
        var missingInA = listA.filter(function(pvb) {
            return listB.filter(function(pva){return JSON.stringify(pva)===JSON.stringify(pvb);}).length===0;
        });
        return missingInA;
    };

    $scope.setDiff2 = function(diffResult, property) {
        if ((diffResult.before[property.first] && diffResult.before[property.first][property.second]) || (diffResult.after[property.first]&& diffResult.after[property.first][property.second])) {
            $scope.diff[property.first] = {};
            $scope.diff[property.first][property.second] = {
                removed: $scope.compareLists(diffResult.before[property.first][property.second], diffResult.after[property.first][property.second])
                , added: $scope.compareLists(diffResult.after[property.first][property.second], diffResult.before[property.first][property.second])
            };              
        }        
    };    
    
    $scope.showDiff = function(diff, fields) {
        return diff[fields.first][fields.second].removed.length>0 || diff[fields.first][fields.second].added.length>0;
    };    
    
    $scope.viewDiff = function (cde) {
        var dmp = new diff_match_patch();
        
        CdeDiff.get({deId: cde._id}, function(diffResult) {
            $scope.diff = {};
            if (diffResult.before.primaryName) {
                var d = dmp.diff_main(diffResult.before.primaryName, diffResult.after.primaryName);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.primaryName = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.primaryDefinition) {
                var d = dmp.diff_main(diffResult.before.primaryDefinition, diffResult.after.primaryDefinition);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.primaryDefinition = dmp.diff_prettyHtml(d);
            }            
            if (diffResult.before.version) {
                $scope.diff.version = "Before: " + diffResult.before.version + " -- After: " + diffResult.after.version;
            }
            if (diffResult.before.stewardOrg) {
                console.log("set")
                $scope.diff.stewardOrg = "Before: " + diffResult.before.stewardOrg.name + " -- After: " + diffResult.after.stewardOrg.name;
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
            if (diffResult.before.naming || diffResult.after.naming) {
                $scope.diff.naming = "Modified";
            }      
            if (diffResult.before.registrationState || diffResult.after.registrationState) {
                $scope.diff.registrationState = "Modified";
            }                
            $scope.setDiff2(diffResult, {first: "property", second: "concepts"});       
            $scope.setDiff2(diffResult, {first: "objectClass", second: "concepts"});       
            $scope.setDiff2(diffResult, {first: "dataElementConcept", second: "concepts"});      
            if (diffResult.before.ids || diffResult.after.ids) {
                $scope.diff.ids = "Modified";
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
    
    $scope.vsacMappingExists = function() {
        return typeof($scope.cde.dataElementConcept.conceptualDomain) !== "undefined" 
            && typeof($scope.cde.dataElementConcept.conceptualDomain.vsac) !== "undefined";
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
                if (data.error) {

                }
                 else if (data === "") {
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
