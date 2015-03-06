angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', 'CdeDiff', function($scope, CdeDiff) {
    var CdeDiffCtrl = this;
    
    // Put general (-1) rules first, specific rules secondly
    CdeDiffCtrl.pathFieldMap = {
        1: [
            {fieldName: "Naming", path: ["naming"]}
            , {fieldName: "Properties", path: ["properties"]}
            , {fieldName: "Identifiers", path: ["ids"]}
        ]
        , 2: [
            {fieldName: "Concepts - Property", path: ["property", "concepts"]}
            , {fieldName: "Concepts - Object Class", path: ["objectClass", "concepts"]}
            , {fieldName: "Concepts - Data Element", path: ["dataElementConcept", "concepts"]}
            , {fieldName: "Registration State", path: ["registrationState", "registrationStatus"]}
            , {fieldName: "Steward Organization", path: ["stewardOrg", "name"]}
            , {fieldName: "Permissible Values - Value Type", path: ["valueDomain", "datatype"]}
            , {fieldName: "Permissible Values - Text", path: ["valueDomain", "datatypeText"]}
            , {fieldName: "Permissible Values - Integer", path: ["valueDomain", "datatypeInteger"]}
            , {fieldName: "Permissible Values - Date", path: ["valueDomain", "datatypeDate"]}              
            
        ]        
        , 3: [
            {fieldName: "Alternative Name", path: ["naming",-1,"designation"]}
            , {fieldName: "Alternative Definition", path: ["naming",-1,"definition"]}        
            , {fieldName: "Primary Name", path: ["naming",0,"designation"]}
            , {fieldName: "Primary Definition", path: ["naming",0,"definition"]}
            , {fieldName: "Permissible Values - Text - Regular Expression", path: ["valueDomain", "datatypeText", "regex"]}
            , {fieldName: "Permissible Values - Text - Freetext Rule", path: ["valueDomain", "datatypeText", "rule"]}
            , {fieldName: "Permissible Values - Text - Maximum Length", path: ["valueDomain", "datatypeText", "maxLength"]}
            , {fieldName: "Permissible Values - Text - Minimum Length", path: ["valueDomain", "datatypeText", "minLength"]} 
            , {fieldName: "Permissible Values - Integer - Maximum Value", path: ["valueDomain", "datatypeInteger", "maxValue"]}
            , {fieldName: "Permissible Values - Integer - Minimum Value", path: ["valueDomain", "datatypeInteger", "minValue"]}     
            , {fieldName: "Permissible Values - Date - Format", path: ["valueDomain", "datatypeDate", "format"]}     
            
            
        ]
        , 4: [
            {fieldName: "Permissible Values", path: ["valueDomain", "permissibleValues", -1, "permissibleValue"]}
            , {fieldName: "Concepts - Data Element - Name", path: ["dataElementConcept", "concepts", -1, "name"]}
            , {fieldName: "Concepts - Data Element - Origin", path: ["dataElementConcept", "concepts", -1, "origin"]}
            , {fieldName: "Concepts - Data Element - Origin ID", path: ["dataElementConcept", "concepts", -1, "originId"]}
        ]
    };
    
    $scope.nullsToBottom = function(obj) {
        return (angular.isDefined(obj.updated) ? 0 : 1);
    };    
    
    CdeDiffCtrl.comparePaths = function(patternPath,realPath){
        var equal = true;
        patternPath.forEach(function(el,i){
            if (typeof el === "number" && el===-1) return;
            if (el===realPath[i]) equal = equal && true;
            else equal = false;
        });
        return equal;
    };
        
    $scope.viewDiff = function (elt) {        
        CdeDiff.get({deId: elt._id}, function(diffResult) {
            diffResult.forEach(function(change){
                this.stringify = function(obj) {
                    if (typeof obj === "string") return obj;
                    return Object.keys(obj).map(function(f){
                        return f + ": " + obj[f];
                    }).join(", ");                    
                };
                if (change.kind==="E") {
                    change.modificationType = "Modified Field";
                    change.newValue = change.lhs;
                    change.previousValue = change.rhs;
                }
                if (change.kind==="N") {
                    change.modificationType = "New Item";
                    change.newValue = this.stringify(change.rhs);
                }                
                if (change.kind==="A" && change.item.kind==="N") {
                    change.modificationType = "New Item";
                    change.newValue = this.stringify(change.item.rhs);                  
                }
                if (change.kind==="A" && change.item.kind==="D") {
                    change.modificationType = "Item Deleted";
                    change.newValue = this.stringify(change.item.lhs);
                }                            
                CdeDiffCtrl.pathFieldMap[change.path.length].forEach(function(pathPair){
                    if (CdeDiffCtrl.comparePaths(pathPair.path, change.path)) change.fieldName = pathPair.fieldName;
                });
            });
            $scope.modifications = diffResult;
        });
    };
}]);